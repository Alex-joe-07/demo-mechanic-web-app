# 3D SCROLL HERO SECTION — CHEAT SHEET

**Goal:** Build a cinematic, scroll-driven motorcycle hero animation using HTML, CSS, JavaScript, Canvas, GSAP and FFmpeg.

## STEP 1 — Prepare Assets
- Select a high-quality motorcycle image.
- Select a short video showing the motorcycle's movement or camera rotation.
- Keep the image as the static fallback.
- Use the video as the animation source.
- Reference websites are for inspiration, NOT assets to copy.

Folder:
```text
assets/
  images/
    classic-landscape.jpg
  videos/
    classic-scroll.mp4
```

## STEP 2 — Install / Check FFmpeg

Check installation:
```powershell
ffmpeg -version
```

If not installed:
```powershell
winget install --id Gyan.FFmpeg -e
```
Restart VS Code terminal and check again.

## STEP 3 — Extract Video Frames

First check video information:
```powershell
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -show_entries format=duration -of default=noprint_wrappers=1 "./assets/videos/classic-scroll.mp4"
```

Create frames folder:
```powershell
New-Item -ItemType Directory -Force "./assets/frames"
```

Remove old extracted frames before regenerating:
```powershell
Remove-Item "./assets/frames/frame-*.jpg" -Force -ErrorAction SilentlyContinue
```

Extract frames at the original video frame rate:
```powershell
ffmpeg -i "./assets/videos/classic-scroll.mp4" -map 0:v:0 -fps_mode passthrough -q:v 3 "./assets/frames/frame-%04d.jpg"
```

## STEP 4 — Audit Extracted Frames

Count frames:
```powershell
(Get-ChildItem "./assets/frames/frame-*.jpg").Count
```

Check image resolution using:
```powershell
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "./assets/videos/classic-scroll.mp4"
```

Check frame sequence and visually inspect random frames.

## STEP 5 — Optimize Frames

Create optimized folder:
```powershell
New-Item -ItemType Directory -Force "./assets/optimized-frames"
```

Convert JPG to WebP:
```powershell
ffmpeg -i "./assets/frames/frame-%04d.jpg" -vf "scale=1280:-2" -fps_mode passthrough -c:v libwebp -quality 75 -compression_level 6 "./assets/optimized-frames/frame-%04d.webp"
```

Check optimized frame count:
```powershell
(Get-ChildItem "./assets/optimized-frames/*.webp").Count
```

Check total size:
```powershell
"{0:N2} MB" -f ((Get-ChildItem "./assets/optimized-frames/*.webp" | Measure-Object Length -Sum).Sum / 1MB)
```

## STEP 6 — Build the Website

Technology:
- HTML — structure
- CSS — layout and responsive design
- JavaScript — frame loading and Canvas rendering
- GSAP — animation engine
- ScrollTrigger — scroll synchronization
- Canvas — display animation frames

Files:
```text
project/
│
├── assets/
│   ├── images/
│   ├── videos/
│   ├── frames/
│   └── optimized-frames/
│
├── index.html
├── style.css
├── script.js
├── package.json
└── package-lock.json
```

## STEP 7 — Animation Logic

1. Create a pinned hero section.
2. Add an HTML Canvas.
3. Load the initial frames.
4. Draw images on Canvas.
5. Connect GSAP ScrollTrigger to frame progress.
6. Map scroll progress to frame numbers.
7. Implement progressive loading and caching.
8. Add responsive canvas sizing and fallback image.

**Core logic:**
```javascript
gsap.to(playhead, {
    frame: FRAME_COUNT - 1,
    ease: "none",
    onUpdate: updateAnimation,
    scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "+=300vh",
        scrub: 0.4,
        pin: true
    }
});
```

## STEP 8 — Final Audits

- [ ] All frames load correctly.
- [ ] No missing image paths (404).
- [ ] Scroll down plays animation.
- [ ] Scroll up reverses animation.
- [ ] No visible frame flickering.
- [ ] No major loading delays.
- [ ] Responsive on mobile.
- [ ] Check browser console.
- [ ] Test on slower internet.
- [ ] Check RAM and dropped frames.

## STEP 9 — Deploy

- Test locally using VS Code Live Server.
- Upload the complete project to GitHub.
- Deploy using Netlify.
- Verify asset paths and animation on the live website.

---

## REUSABLE CHATGPT PROMPT

I want to build a premium, cinematic, scroll-driven 3D-style hero section for a motorcycle website.

My assets:
- Static reference/fallback image.
- Motorcycle animation video.
- Extracted and optimized WebP frames.

My stack:
HTML, CSS, Vanilla JavaScript, Canvas, GSAP and ScrollTrigger.

Instructions:
1. First inspect my folder structure and assets.
2. Ask for missing information only when necessary.
3. Generate complete, compatible HTML, CSS and JS.
4. Provide code file by file.
5. Explain where each code block belongs.
6. Explain important JavaScript concepts while implementing.
7. Prioritize smooth scroll synchronization, frame caching, progressive loading and responsive design.
8. Do not introduce Three.js or Blender unless technically necessary.
9. Do not overwrite existing code without inspecting it.
10. After each stage, ask me to test and share a screenshot or error before proceeding.

**Design direction:** Premium Royal Enfield aesthetic, cinematic transitions, minimal typography, refined spacing and smooth scroll interactions.

**Important:** Teach me how everything works. Do not just deliver finished code.