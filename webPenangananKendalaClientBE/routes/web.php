<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Swagger UI Routes
Route::get('/swagger', function () {
    return view('swagger');
})->name('swagger.ui');

Route::get('/api/documentation', function () {
    return view('swagger');
})->name('swagger.documentation');

Route::get('/docs/swagger', function () {
    return view('swagger');
})->name('swagger.docs');

Route::get('/swagger.json', function () {
    $path = public_path('swagger.json');
    if (file_exists($path)) {
        return response()->file($path, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
    return redirect('/docs/api.json');
})->name('swagger.json');
