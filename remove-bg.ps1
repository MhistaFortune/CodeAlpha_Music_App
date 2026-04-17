Add-Type -AssemblyName System.Drawing

$path = "c:\Users\USER\Desktop\My Personal Projects\CodeApha_Music_App\public\favicon.png"
$img = [System.Drawing.Bitmap]::FromFile($path)
$newImg = New-Object System.Drawing.Bitmap $img.Width, $img.Height

for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = 0; $x -lt $img.Width; $x++) {
        $c = $img.GetPixel($x, $y)
        # Simple Euclidean distance from white
        $dist = [Math]::Sqrt([Math]::Pow(255 - $c.R, 2) + [Math]::Pow(255 - $c.G, 2) + [Math]::Pow(255 - $c.B, 2))
        
        if ($dist -lt 50) {
            # Make smooth transition for antialiasing
            $alpha = [Math]::Max(0, [Math]::Min(255, [Math]::Round($dist * 5.1)))
            $newC = [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B)
            $newImg.SetPixel($x, $y, $newC)
        } else {
            $newImg.SetPixel($x, $y, $c)
        }
    }
}

$img.Dispose()
$newImg.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
$newImg.Dispose()
Write-Host "Done processing image."
