import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// --- 1. Populate Contributors ---
// --- 1. Populate Contributors ---
async function loadContributors() {
    try {
        const response = await fetch('./contributer.josn');
        const contributors = await response.json();

        // We have 3 layers. We'll distribute users.
        const layer1 = document.getElementById('layer-1');
        const layer2 = document.getElementById('layer-2');
        const layer3 = document.getElementById('layer-3');

        const layers = [layer1, layer2, layer3];

        // Logic to Map 9 Items to Visual Layout:
        // c1(0) c2(1) c3(2)  -> Row 1
        // c4(3) Logo  c5(4)  -> Row 2
        // c6(5) c7(6) c8(7)  -> Row 3
        //       c9(8)        -> Row 4

        // CSS Expects Append Order:
        // L1: c1(0), c3(2), c6(5), c8(7)
        // L2: c4(3), c5(4)
        // L3: c2(1), c7(6), c9(8)

        contributors.forEach((contributor, index) => {
            const div = document.createElement("div");
            div.className = "contributor-item";

            // Image
            const img = document.createElement("img");
            img.src = contributor.avatar_url;
            img.alt = contributor.login;

            // Info Overlay (Name + Login)
            const info = document.createElement("div");
            info.className = "contributor-info";
            info.innerHTML = `
                <div class="contributor-name">${contributor.name || contributor.login}</div>
                <div class="contributor-login">@${contributor.login}</div>
            `;

            div.appendChild(img);
            div.appendChild(info);

            // Distribution Map based on Index
            if (index === 0 || index === 2 || index === 5 || index === 7) {
                layer1.appendChild(div); // Corners
            } else if (index === 3 || index === 4) {
                layer2.appendChild(div); // Sides
            } else if (index === 1 || index === 6 || index === 8) {
                layer3.appendChild(div); // Verticals
            }
        });

    } catch (error) {
        console.error("Error loading contributors:", error);
    }
}


// --- 2. Animations ---

function initAnimations() {

    // Hero Rocket Animation
    gsap.to(".rocket", {
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: 1
        },
        y: -300,
        scale: 1.5,
        rotation: -10,
        ease: "power1.inOut"
    });

    gsap.to(".hero-subtitle", {
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: 1
        },
        y: -100,
        opacity: 0
    });

    // Features Cards Stacking
    if (window.innerWidth > 768) {
        const cards = gsap.utils.toArray(".card");

        ScrollTrigger.create({
            trigger: ".features-section",
            start: "top top",
            end: "+=2000",
            pin: true,
            scrub: true,
            animation: gsap.from(cards, {
                y: 800,
                opacity: 0,
                stagger: 0.5,
                duration: 1,
                ease: "power2.out"
            })
        });
    }

    // --- Contributors Animation (Refined) ---
    // Goal: Logo starts LARGE (80% viewport). Contributors start hidden (scale 0) behind it.
    // Scroll: Logo shrinks. Contributors scale UP from center.

    const contTL = gsap.timeline({
        scrollTrigger: {
            trigger: ".contributors-section",
            start: "top top",
            end: "+=2500",
            pin: true,
            scrub: 1
        }
    });

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 1. Scaler Animation (Logo)
    // Logic: Animate FROM "80% viewport" TO "grid cell size".
    // User requested "app logo initial wise reduce 40%". Previous was ~6-8. Let's go to 4.

    // We target the internal container to avoid messing with grid positioning of .scaler
    contTL.from(".scaler .logo-container", {
        scale: 4,
        borderRadius: 48,
        duration: 1,
        ease: "power2.inOut"
    }, 0);

    // 2. Layers Animation
    // Target the LAYER PARENTS (#layer-1, #layer-2...)
    // Scaling them from 0 to 1 will make their grid children appear to expand from the center.

    // Important: We must use a 'from' tween that sets them to scale: 0 initially.
    // And we overlap this with the scaler shrinking.

    // Layer 1 (Outer)
    contTL.from("#layer-1", {
        scale: 0,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
    }, 0);

    // Layer 2 (Middle)
    contTL.from("#layer-2", {
        scale: 0,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
    }, 0.1);

    // Layer 3 (Inner)
    contTL.from("#layer-3", {
        scale: 0,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
    }, 0.2);

}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadContributors();
    initAnimations();
});
