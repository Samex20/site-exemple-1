import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const DEFAULT_CHAPTER_IDS = ["#chapter-0", "#chapter-1", "#chapter-2"];

/**
 * Scroll-controlled weapon rotation with transition overlay.
 * - Each chapter is pinned while user scrolls to rotate the weapon 360°
 * - When rotation completes, transition overlay plays
 * - After transition, user is on the next chapter
 */
export function useScrollStory({
  experienceRef,
  onChapterChange,
  onBlendChange,
  chapterIds = DEFAULT_CHAPTER_IDS,
}) {
  const isTransitioningRef = useRef(false);
  const hasTriggeredTransition = useRef(new Set());
  const chapterTriggersRef = useRef([]);
  const onChapterChangeRef = useRef(onChapterChange);
  const onBlendChangeRef = useRef(onBlendChange);
  const assetsReadyRef = useRef(false);

  useEffect(() => {
    onChapterChangeRef.current = onChapterChange;
  }, [onChapterChange]);

  useEffect(() => {
    onBlendChangeRef.current = onBlendChange;
  }, [onBlendChange]);

  useEffect(() => {
    assetsReadyRef.current = false;

    // Init state
    if (experienceRef?.current) {
      experienceRef.current.activeChapter = 0;
      experienceRef.current.chapterProgress = new Array(chapterIds.length).fill(0);
      experienceRef.current.blend = null;
    }
    onChapterChangeRef.current?.(0);

    const triggers = [];
    const getScroll =
      typeof ScrollTrigger.getScrollFunc === "function"
        ? ScrollTrigger.getScrollFunc(window)
        : () => window.scrollY || 0;

    // Animation d'entrée du texte
    const animateChapterEntry = (section) => {
      if (!section) return;
      if (!assetsReadyRef.current) return;
      const els = Array.from(section.querySelectorAll("[data-reveal]"));
      if (!els.length) return;

      gsap.fromTo(
        els,
        { autoAlpha: 0, y: 30, filter: "blur(10px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.09,
          overwrite: true,
        }
      );

      els.forEach((el, idx) => {
        if (!el?.hasAttribute("data-scramble")) return;
        gsap.delayedCall(0.2 + idx * 0.08, () => scrambleText(el, 1.2));
      });
    };

    const scrambleText = (el, duration = 1.1) => {
      if (!el) return;
      const original = el.dataset.scrambleText || el.textContent || "";
      el.dataset.scrambleText = original;
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const total = Math.max(1, Math.floor(duration * 60));
      let frame = 0;
      let last = "";

      const update = () => {
        const p = Math.min(1, frame / total);
        const revealCount = Math.floor(original.length * p);
        let out = "";

        for (let i = 0; i < original.length; i += 1) {
          const c = original[i];
          if (i < revealCount || c === " ") {
            out += c;
          } else {
            out += chars[Math.floor(Math.random() * chars.length)];
          }
        }

        if (out !== last) {
          el.textContent = out;
          last = out;
        }

        frame += 1;
        if (frame > total) {
          el.textContent = original;
          gsap.ticker.remove(update);
        }
      };

      gsap.ticker.add(update);
    };

    const resolveActiveChapter = () => {
      if (isTransitioningRef.current) return;
      if (!experienceRef?.current) return;

      const scrollY = getScroll();
      let nextIdx = 0;
      let found = false;
      let bestStart = -Infinity;

      chapterTriggersRef.current.forEach((t, idx) => {
        if (!t) return;
        if (scrollY >= t.start && scrollY < t.end && t.start >= bestStart) {
          bestStart = t.start;
          nextIdx = idx;
          found = true;
        }
      });

      if (!found) {
        const first = chapterTriggersRef.current[0];
        const lastIdx = chapterTriggersRef.current.length - 1;
        const last = chapterTriggersRef.current[lastIdx];
        if (first && scrollY < first.start) {
          nextIdx = 0;
        } else if (last && scrollY >= last.end) {
          nextIdx = lastIdx;
        } else {
          return;
        }
      }

      if (experienceRef.current.activeChapter !== nextIdx) {
        experienceRef.current.activeChapter = nextIdx;
        onChapterChangeRef.current?.(nextIdx);
      }
    };

        const handleAssetsReady = () => {
      assetsReadyRef.current = true;
      const entrySection = document.querySelector("#entry");
      if (entrySection) {
        gsap.delayedCall(0.1, () => animateChapterEntry(entrySection));
      }
      const currentIdx = experienceRef?.current?.activeChapter ?? 0;
      const currentSection = document.querySelector(chapterIds[currentIdx]);
      if (currentSection) {
        gsap.delayedCall(0.15, () => animateChapterEntry(currentSection));
      }
    };

    const onAssetsReady = () => handleAssetsReady();
    window.addEventListener("assets-ready", onAssetsReady);

    // Joue l'animation de transition overlay puis scrolle vers le prochain chapitre
    // Seulement pour progression FORWARD (pas pour scroll back)
    const playTransitionAndJump = (fromIdx, toIdx) => {
      if (isTransitioningRef.current) return;
      if (toIdx >= chapterIds.length) return;
      // Ne jouer la transition que si on progresse vers l'avant
      if (toIdx <= fromIdx) return;
      
      isTransitioningRef.current = true;

      // Notify blend start
      if (experienceRef.current) {
        experienceRef.current.blend = { from: fromIdx, to: toIdx, t: 0 };
      }
      onBlendChangeRef.current?.({ from: fromIdx, to: toIdx, t: 0 });

      // À mi-parcours de l'animation (0.6s), jump au prochain chapitre
      gsap.delayedCall(0.6, () => {
        const nextTrigger = chapterTriggersRef.current[toIdx];
        if (nextTrigger) {
          // Scroll vers le début du prochain trigger
          window.scrollTo(0, nextTrigger.start + 10);
        }

        // Update chapter
        if (experienceRef.current) {
          experienceRef.current.activeChapter = toIdx;
          experienceRef.current.chapterProgress[toIdx] = 0;
        }
        onChapterChangeRef.current?.(toIdx);

      });

      // Fin de l'animation
      gsap.delayedCall(1.5, () => {
        isTransitioningRef.current = false;
        hasTriggeredTransition.current.delete(fromIdx);

        // Clear blend
        if (experienceRef.current) {
          experienceRef.current.blend = null;
        }
        onBlendChangeRef.current?.(null);

        const nextSection = document.querySelector(chapterIds[toIdx]);
        gsap.delayedCall(0.05, () => animateChapterEntry(nextSection));
      });
    };

    // Créer un ScrollTrigger pour chaque chapitre
    chapterTriggersRef.current = [];
    
    chapterIds.forEach((id, idx) => {
      const section = document.querySelector(id);
      if (!section) return;

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=200%", // 2x la hauteur de l'écran pour le scroll
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,

        onEnter: () => {
          if (!isTransitioningRef.current && experienceRef.current) {
            experienceRef.current.activeChapter = idx;
            onChapterChangeRef.current?.(idx);
            animateChapterEntry(section);
          }
        },

        onEnterBack: () => {
          if (!isTransitioningRef.current && experienceRef.current) {
            experienceRef.current.activeChapter = idx;
            onChapterChangeRef.current?.(idx);
          }
        },

        onUpdate: (self) => {
          if (isTransitioningRef.current) return;
          if (!experienceRef?.current) return;

          const progress = self.progress;

          // Rotation 0 -> 360° basée sur le scroll (0 à 95%)
          const rotationProgress = Math.min(1, progress / 0.95);
          experienceRef.current.chapterProgress[idx] = rotationProgress;

          // Quand on atteint 95%+, déclencher la transition vers le prochain chapitre
          if (progress >= 0.95 && idx < chapterIds.length - 1 && self.direction > 0) {
            if (!hasTriggeredTransition.current.has(idx)) {
              hasTriggeredTransition.current.add(idx);
              playTransitionAndJump(idx, idx + 1);
            }
          }
        },
      });

      triggers.push(st);
      chapterTriggersRef.current.push(st);
    });

    const activeTrigger = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: resolveActiveChapter,
      onRefresh: resolveActiveChapter,
    });

    const snapTrigger = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      snap: {
        delay: 0.1,
        duration: { min: 0.25, max: 0.8 },
        ease: "power2.inOut",
        snapTo: (value) => {
          // Ne pas snapper pendant les transitions
          if (isTransitioningRef.current) return value;
          
          const max = ScrollTrigger.maxScroll(window) || 1;
          const points = chapterTriggersRef.current
            .map((t) => (t ? t.start / max : null))
            .filter((v) => v != null);
          
          if (!points.length) return value;
          
          // Trouver le point le plus proche
          let closest = points[0];
          let best = Math.abs(value - closest);
          for (let i = 1; i < points.length; i += 1) {
            const d = Math.abs(value - points[i]);
            if (d < best) {
              best = d;
              closest = points[i];
            }
          }
          return closest;
        },
      },
    });

    // Animate first chapter on load
    const firstSection = document.querySelector(chapterIds[0]);
    if (firstSection && assetsReadyRef.current) {
      gsap.delayedCall(0.3, () => animateChapterEntry(firstSection));
    }

    // Initial refresh
    gsap.delayedCall(0.1, () => ScrollTrigger.refresh());
    gsap.delayedCall(0.2, () => resolveActiveChapter());

    return () => {
      window.removeEventListener("assets-ready", onAssetsReady);
      triggers.forEach((t) => t.kill());
      activeTrigger.kill();
      snapTrigger.kill();
      chapterTriggersRef.current = [];
    };
  }, [experienceRef, chapterIds]);
}
