# Downloads the photos, partner logos and bylaws from the old GoDaddy site
# into this project, so the new site no longer depends on GoDaddy.
#
# Run it once, from the FOTCL folder, in VS Code's terminal:
#   powershell -ExecutionPolicy Bypass -File tools\get-photos.ps1

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"   # makes downloads much faster

$base = "https://img1.wsimg.com/isteam/ip/426e5310-f3ec-470b-af8e-1451dc94847f/"
$root = Split-Path -Parent $PSScriptRoot

$photoFolder = Join-Path $root "images\photo-originals"
$logoFolder = Join-Path $root "images\partners"
$fileFolder = Join-Path $root "files"
New-Item -ItemType Directory -Force -Path $photoFolder, $logoFolder, $fileFolder | Out-Null

# New name = name on the GoDaddy site (photos are saved 1600 pixels wide)
$photos = [ordered]@{
    "story-time.jpg"               = "friends%20children.jpg"
    "crafts.jpg"                   = "IMG_0414.JPG"
    "fishing-fundamentals-2019.jpg" = "Fishing%20Fundamentals%202019%201.jpg"
    "little-free-library.jpg"      = "TCPL%20staff%20and%20volunteers%20with%20Lions%20Club%20LFL.jpg"
    "technology.jpg"               = "IMG_1995.JPG"
    "hands-on-learning.jpg"        = "IMG_2694.JPG"
    "excellence-award-2019.jpg"    = "2019%20TMLDA%20Award%20Presentation.jpg"
    "childrens-program.jpg"        = "IMG_4286.JPG"
    "outdoor-family-event.jpg"     = "IMG_4313.jpg"
    "historical-marker.jpg"        = "IMG_0325.JPG"
    "books-on-display.jpg"         = "IMG_4239.JPG"
    "unicorn-visit.jpg"            = "library%20kids.jpg"
}

$logos = [ordered]@{
    "the-colony-public-library.png" = "the%20colony%20public%20library.png"
    "the-colony-chamber.png"        = "the%20colony%20chamber.png"
    "visit-the-colony.png"          = "visit%20the%20colony%20texas.png"
    "north-texas-giving-day.png"    = "NTX%20Giving%20Day%20Logo.png"
    "grandscape.png"                = "grandscape-logo.png"
    "lakeside-community-theatre.jpg" = "lakeside.jpg"
}

foreach ($name in $photos.Keys) {
    Write-Host "Photo: $name"
    Invoke-WebRequest -Uri ($base + $photos[$name] + "/:/rs=w:1600") -OutFile (Join-Path $photoFolder $name) -UseBasicParsing
}

foreach ($name in $logos.Keys) {
    Write-Host "Logo:  $name"
    Invoke-WebRequest -Uri ($base + $logos[$name] + "/:/rs=w:600") -OutFile (Join-Path $logoFolder $name) -UseBasicParsing
}

Write-Host "Bylaws PDF"
Invoke-WebRequest -Uri "https://img1.wsimg.com/blobby/go/426e5310-f3ec-470b-af8e-1451dc94847f/downloads/30%20April%202022%20bylaws.pdf?ver=1777655523602" -OutFile (Join-Path $fileFolder "bylaws-2022-04-30.pdf") -UseBasicParsing

Write-Host ""
Write-Host "All done! $($photos.Count) photos, $($logos.Count) logos and the bylaws are in your project."
Write-Host "Tell Claude they're downloaded."
