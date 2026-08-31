<?php

namespace App\Http\Controllers;

use App\Models\PhishingReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PhishingReportController extends Controller
{
    public function index(Request $request)
    {
        $query = PhishingReport::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('url', 'like', '%' . $request->search . '%')
                  ->orWhere('domain', 'like', '%' . $request->search . '%')
                  ->orWhere('ip_address', 'like', '%' . $request->search . '%');
            });
        }

        $reports = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($reports);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|url',
            'description' => 'nullable|string',
            'reporter_name' => 'nullable|string|max:255',
            'reporter_email' => 'nullable|email|max:255',
        ]);

        $parsedUrl = parse_url($validated['url']);
        $domain = $parsedUrl['host'] ?? null;

        $report = PhishingReport::create([
            'url' => $validated['url'],
            'domain' => $domain,
            'description' => $validated['description'],
            'reporter_name' => $validated['reporter_name'],
            'reporter_email' => $validated['reporter_email'],
            'status' => 'pending',
            'reported_at' => now(),
        ]);

        // Dispatch job to gather info (IP, geolocation, screenshot)
        // For simplicity, we do it inline here
        $this->gatherReportInfo($report);

        return response()->json($report, 201);
    }

    public function show(PhishingReport $report)
    {
        return response()->json($report);
    }

    public function update(Request $request, PhishingReport $report)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,verified,investigating,resolved,false_positive',
            'description' => 'nullable|string',
            'verified_at' => 'nullable|date',
        ]);

        $report->update($validated);

        return response()->json($report);
    }

    public function destroy(PhishingReport $report)
    {
        if ($report->screenshot_path) {
            Storage::disk('public')->delete($report->screenshot_path);
        }

        $report->delete();

        return response()->json(null, 204);
    }

    protected function gatherReportInfo(PhishingReport $report): void
    {
        // Resolve IP address
        $ip = gethostbyname($report->domain);
        if ($ip && $ip !== $report->domain) {
            $report->ip_address = $ip;
        }

        // Get geolocation
        if ($report->ip_address) {
            try {
                $response = Http::get('http://ip-api.com/json/' . $report->ip_address);
                if ($response->successful()) {
                    $data = $response->json();
                    $report->country = $data['country'] ?? null;
                    $report->city = $data['city'] ?? null;
                    $report->latitude = $data['lat'] ?? null;
                    $report->longitude = $data['lon'] ?? null;
                }
            } catch (\Exception $e) {
                // Silently fail geolocation
            }
        }

        // Take screenshot via external service (placeholder)
        // In production, use a headless browser service or API like urlbox, screenshotapi, etc.
        $report->screenshot_url = 'https://via.placeholder.com/1200x800/cccccc/999999?text=Screenshot+of+' . urlencode($report->domain);

        $report->save();
    }
}
