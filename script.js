// script.js

/* =========================================
   Helpers
   ========================================= */
   const $ = (sel, root = document) => root.querySelector(sel);
   const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
   
   function jumpTo(selector){
     const el = $(selector);
     if (!el) return;
     el.scrollIntoView({ behavior: "smooth", block: "start" });
   }
   
   function showToast(message){
     const toast = $("#toast");
     if (!toast) return;
     toast.textContent = message;
     toast.classList.add("show");
     window.clearTimeout(showToast._t);
     showToast._t = window.setTimeout(() => toast.classList.remove("show"), 2800);
   }
   
   /* =========================================
      Sticky mini header on scroll
      ========================================= */
   (() => {
     const mini = $("#miniHeader");
     if (!mini) return;
   
     const onScroll = () => {
       const y = window.scrollY || document.documentElement.scrollTop;
       if (y > 260) mini.classList.add("is-visible");
       else mini.classList.remove("is-visible");
     };
     window.addEventListener("scroll", onScroll, { passive: true });
     onScroll();
   })();
   
   /* =========================================
      Jump buttons (no tab navigation)
      ========================================= */
   $$("[data-jump]").forEach(btn => {
     btn.addEventListener("click", () => jumpTo(btn.getAttribute("data-jump")));
   });
   
   /* =========================================
      IntersectionObserver reveal animations
      ========================================= */
   (() => {
     const items = $$(".reveal");
     if (!items.length) return;
   
     const io = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting){
           entry.target.classList.add("is-visible");
           io.unobserve(entry.target);
         }
       });
     }, { threshold: 0.12 });
   
     items.forEach(el => io.observe(el));
   })();
   
   /* =========================================
      Modal system (reusable)
      ========================================= */
   const modal = $("#modal");
   const modalTitle = $("#modalTitle");
   const modalBody = $("#modalBody");
   let lastFocusedEl = null;
   
   const ministryDetails = {
     kids: {
       title: "Kids Ministry",
       body: `
         <p><strong>Safe, joyful, and age-appropriate.</strong> Our kids ministry helps children know Jesus through Bible stories, worship songs, crafts, and play.</p>
         <p><em>Check-in:</em> available before each service. Our team will help you get set up quickly.</p>
         <p><em>Age groups:</em> Nursery, Preschool, Elementary.</p>
       `
     },
     youth: {
       title: "Youth Ministry",
       body: `
         <p>Weekly gatherings for teens with worship, small groups, and mentoring. We focus on faith that feels real in everyday life.</p>
         <p><em>Typical night:</em> games, worship, message, and discussion groups.</p>
       `
     },
     women: {
       title: "Women’s Ministry",
       body: `
         <p>Community for women in every season—Bible study, prayer nights, and meaningful friendships.</p>
         <p><em>Opportunities:</em> weekly study groups, mentorship, service projects.</p>
       `
     },
     men: {
       title: "Men’s Ministry",
       body: `
         <p>A place for encouragement and growth through Scripture, accountability, and practical discipleship.</p>
         <p><em>Opportunities:</em> small groups, serving teams, outreach projects.</p>
       `
     },
     worship: {
       title: "Worship Ministry",
       body: `
         <p>We lead the church in worship with excellence and humility—musicians and vocalists welcome.</p>
         <p><em>Get involved:</em> auditions, training, and regular rehearsals.</p>
       `
     },
     outreach: {
       title: "Outreach Ministry",
       body: `
         <p>We serve our city through partnerships, food support, and practical care.</p>
         <p><em>Serve day:</em> monthly opportunities for individuals and families.</p>
       `
     }
   };
   
   const modalTemplates = {
     sermons: {
       title: "More Sermons",
       body: `
         <p>Replace these links with your sermon playlist, channel, or archive:</p>
         <ul>
           <li><a href="https://www.youtube.com/" target="_blank" rel="noopener">YouTube Sermons Playlist</a></li>
           <li><a href="#" target="_blank" rel="noopener">Podcast (Spotify/Apple)</a></li>
           <li><a href="#" target="_blank" rel="noopener">Sermon Notes PDF</a></li>
         </ul>
         <p class="small">Tip: You can embed a playlist instead of a single video in the Watch section.</p>
       `
     },
     "giving-online": {
       title: "Give Online",
       body: `
         <p>If you use a giving provider (e.g., Razorpay/PayPal/Stripe), paste the link here.</p>
         <p>For now, this is a placeholder modal. You can:</p>
         <ul>
           <li>Link a “Give Online” button to your payment page</li>
           <li>Or embed your provider widget (if they support it)</li>
         </ul>
         <p class="small muted-text">No payment is processed in this demo.</p>
       `
     },
     "giving-upi": {
       title: "Give via UPI",
       body: `
         <p>Use the UPI ID below (replace with your church UPI):</p>
         <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:10px 0;">
           <code id="upiId">yourchurch@upi</code>
           <button class="btn btn-primary btn-small" type="button" id="copyUpi">Copy UPI ID</button>
         </div>
         <p class="small muted-text">After copying, open your UPI app and paste the ID.</p>
       `
     }
   };
   
   function openModal({ title, body }){
     if (!modal) return;
     lastFocusedEl = document.activeElement;
   
     modalTitle.textContent = title || "";
     modalBody.innerHTML = body || "";
   
     modal.classList.add("is-open");
     modal.setAttribute("aria-hidden", "false");
   
     // Focus first focusable element in modal
     const focusables = $$('button, a, input, textarea, [tabindex]:not([tabindex="-1"])', modal);
     const closeBtn = $('[data-modal-close]', modal);
     (focusables[0] || closeBtn)?.focus();
   
     // Special: wire up copy button if present
     const copyBtn = $("#copyUpi");
     if (copyBtn){
       copyBtn.addEventListener("click", async () => {
         const upi = $("#upiId")?.textContent?.trim() || "";
         try{
           await navigator.clipboard.writeText(upi);
           showToast("UPI ID copied!");
         }catch{
           showToast("Copy failed. Please copy manually.");
         }
       }, { once: true });
     }
   }
   
   function closeModal(){
     if (!modal) return;
     modal.classList.remove("is-open");
     modal.setAttribute("aria-hidden", "true");
     modalBody.innerHTML = "";
     // restore focus
     lastFocusedEl?.focus?.();
   }
   
   $$("[data-modal-open]").forEach(btn => {
     btn.addEventListener("click", () => {
       const key = btn.getAttribute("data-modal-open");
       if (key === "ministry"){
         const which = btn.getAttribute("data-ministry");
         const detail = ministryDetails[which];
         if (detail) openModal(detail);
         return;
       }
       const tpl = modalTemplates[key];
       if (tpl) openModal(tpl);
     });
   });
   
   if (modal){
     // Close when clicking backdrop or close button
     modal.addEventListener("click", (e) => {
       const t = e.target;
       if (t && (t.matches("[data-modal-close]") || t.classList.contains("modal-backdrop"))){
         closeModal();
       }
     });
   
     // Escape key + focus trap
     document.addEventListener("keydown", (e) => {
       if (!modal.classList.contains("is-open")) return;
       if (e.key === "Escape") closeModal();
   
       if (e.key === "Tab"){
         const focusables = $$('button, a, input, textarea, [tabindex]:not([tabindex="-1"])', modal)
           .filter(el => !el.hasAttribute("disabled"));
         if (!focusables.length) return;
   
         const first = focusables[0];
         const last = focusables[focusables.length - 1];
   
         if (e.shiftKey && document.activeElement === first){
           e.preventDefault();
           last.focus();
         } else if (!e.shiftKey && document.activeElement === last){
           e.preventDefault();
           first.focus();
         }
       }
     });
   }
   
   /* =========================================
      Gallery lightbox
      ========================================= */
   const lightbox = $("#lightbox");
   const lightboxImg = $("#lightboxImg");
   const lightboxCaption = $("#lightboxCaption");
   let lastFocusedGalleryEl = null;
   
   function openLightbox(src, alt){
     if (!lightbox) return;
     lastFocusedGalleryEl = document.activeElement;
   
     lightboxImg.src = src;
     lightboxImg.alt = alt || "Gallery image";
     lightboxCaption.textContent = alt || "";
   
     lightbox.classList.add("is-open");
     lightbox.setAttribute("aria-hidden", "false");
   
     const closeBtn = $('[data-lightbox-close]', lightbox);
     closeBtn?.focus();
   }
   
   function closeLightbox(){
     if (!lightbox) return;
     lightbox.classList.remove("is-open");
     lightbox.setAttribute("aria-hidden", "true");
     lightboxImg.src = "";
     lightboxCaption.textContent = "";
     lastFocusedGalleryEl?.focus?.();
   }
   
   $$(".gallery-item").forEach(btn => {
     btn.addEventListener("click", () => {
       const full = btn.getAttribute("data-full");
       const img = $("img", btn);
       openLightbox(full, img?.alt || "");
     });
   });
   
   if (lightbox){
     lightbox.addEventListener("click", (e) => {
       const t = e.target;
       if (t && (t.matches("[data-lightbox-close]") || t.classList.contains("lightbox-backdrop"))){
         closeLightbox();
       }
     });
   
     document.addEventListener("keydown", (e) => {
       if (!lightbox.classList.contains("is-open")) return;
       if (e.key === "Escape") closeLightbox();
     });
   }
   
   /* =========================================
      Events filter
      ========================================= */
   (() => {
     const chips = $$(".chip");
     const events = $$(".event");
     if (!chips.length || !events.length) return;
   
     function setActiveChip(active){
       chips.forEach(c => c.classList.toggle("is-active", c === active));
     }
   
     function applyFilter(filter){
       events.forEach(card => {
         const cat = card.getAttribute("data-category");
         const show = (filter === "all") || (cat === filter);
         card.style.display = show ? "" : "none";
       });
     }
   
     chips.forEach(chip => {
       chip.addEventListener("click", () => {
         const filter = chip.getAttribute("data-filter");
         setActiveChip(chip);
         applyFilter(filter);
       });
     });
   })();
   
   /* =========================================
      ICS download (Add-to-Calendar)
      ========================================= */
   const icsEvents = {
     "midweek-prayer": {
       title: "Midweek Prayer",
       start: "20260107T133000Z", // adjust time zone if needed
       end:   "20260107T143000Z",
       location: "Grace Community Church",
       description: "Prayer gathering."
     },
     "youth-night": {
       title: "Youth Night",
       start: "20260110T123000Z",
       end:   "20260110T143000Z",
       location: "Grace Community Church",
       description: "Youth gathering."
     },
     "community-lunch": {
       title: "Community Lunch",
       start: "20260118T063000Z",
       end:   "20260118T073000Z",
       location: "Grace Community Church",
       description: "Lunch after service."
     },
     "serve-day": {
       title: "Serve Day",
       start: "20260124T033000Z",
       end:   "20260124T063000Z",
       location: "Grace Community Church",
       description: "Serving our city."
     }
   };
   
   function downloadICS(key){
     const ev = icsEvents[key];
     if (!ev) return;
   
     const uid = `${key}-${Date.now()}@yourchurch.local`;
     const ics =
   `BEGIN:VCALENDAR
   VERSION:2.0
   PRODID:-//Grace Community Church//Events//EN
   CALSCALE:GREGORIAN
   METHOD:PUBLISH
   BEGIN:VEVENT
   UID:${uid}
   DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").split(".")[0]}Z
   DTSTART:${ev.start}
   DTEND:${ev.end}
   SUMMARY:${ev.title}
   LOCATION:${ev.location}
   DESCRIPTION:${ev.description}
   END:VEVENT
   END:VCALENDAR`;
   
     const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
     const url = URL.createObjectURL(blob);
   
     const a = document.createElement("a");
     a.href = url;
     a.download = `${key}.ics`;
     document.body.appendChild(a);
     a.click();
     a.remove();
   
     URL.revokeObjectURL(url);
     showToast("Calendar file downloaded.");
   }
   
   $$("[data-ics]").forEach(btn => {
     btn.addEventListener("click", () => downloadICS(btn.getAttribute("data-ics")));
   });
   
   /* =========================================
      Prayer form validation + success toast
      (optional mailto)
      ========================================= */
   (() => {
     const form = $("#prayerForm");
     if (!form) return;
   
     const setError = (name, msg) => {
       const p = form.querySelector(`[data-error-for="${name}"]`);
       if (p) p.textContent = msg || "";
     };
   
     const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
   
     form.addEventListener("submit", (e) => {
       e.preventDefault();
   
       const name = $("#name")?.value.trim() || "";
       const contact = $("#contact")?.value.trim() || "";
       const message = $("#message")?.value.trim() || "";
       const consent = $("#consent")?.checked || false;
   
       let ok = true;
   
       // reset
       ["name","contact","message","consent"].forEach(k => setError(k, ""));
   
       if (!name){
         setError("name", "Please enter your name.");
         ok = false;
       }
   
       if (!message){
         setError("message", "Please share a prayer request.");
         ok = false;
       }
   
       if (!consent){
         setError("consent", "Please confirm consent.");
         ok = false;
       }
   
       // If contact exists, validate lightly (email or phone-ish)
       if (contact){
         const phoneish = /^[+()\-0-9\s]{7,}$/.test(contact);
         if (!isEmail(contact) && !phoneish){
           setError("contact", "Please enter a valid email or phone number (or leave it blank).");
           ok = false;
         }
       }
   
       if (!ok){
         showToast("Please fix the highlighted fields.");
         return;
       }
   
       showToast("Thank you — we received your request.");
   
       // Optional: open a mail draft (replace email address)
       const churchEmail = "hello@yourchurch.org";
       const subject = encodeURIComponent(`Prayer Request from ${name}`);
       const body = encodeURIComponent(
         `Name: ${name}\nContact: ${contact || "—"}\n\nPrayer Request:\n${message}\n\nConsent: Yes`
       );
   
       // Uncomment next line if you want it to open email automatically:
       // window.location.href = `mailto:${churchEmail}?subject=${subject}&body=${body}`;
   
       form.reset();
     });
   })();
   
   /* =========================================
      Dark mode toggle (remember preference)
      ========================================= */
   (() => {
     const btn = $("#themeToggle");
     if (!btn) return;
   
     const root = document.documentElement;
   
     const apply = (theme) => {
       if (theme) root.setAttribute("data-theme", theme);
       else root.removeAttribute("data-theme");
       btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
     };
   
     const saved = localStorage.getItem("theme");
     if (saved === "dark") apply("dark");
   
     btn.addEventListener("click", () => {
       const isDark = root.getAttribute("data-theme") === "dark";
       if (isDark){
         apply(null);
         localStorage.removeItem("theme");
         showToast("Light mode");
       } else {
         apply("dark");
         localStorage.setItem("theme", "dark");
         showToast("Dark mode");
       }
     });
   })();
   
   /* =========================================
      Footer year
      ========================================= */
   (() => {
     const y = $("#year");
     if (y) y.textContent = String(new Date().getFullYear());
   })();
   
   /* =========================================
      END MAP (Leaflet) - You will input coordinates
      - Uses Leaflet JS/CSS via CDN (no framework)
      - Replace CHURCH_LAT and CHURCH_LNG below
      ========================================= */
   const CHURCH_LAT = 28.6139;  // <-- replace with your latitude
   const CHURCH_LNG = 77.2090;  // <-- replace with your longitude
   const CHURCH_LABEL = "Grace Community Church"; // <-- replace marker label if desired
   
   function loadLeaflet(){
     return new Promise((resolve, reject) => {
       // CSS
       const css = document.createElement("link");
       css.rel = "stylesheet";
       css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
       css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
       css.crossOrigin = "";
       document.head.appendChild(css);
   
       // JS
       const s = document.createElement("script");
       s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
       s.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
       s.crossOrigin = "";
       s.onload = () => resolve();
       s.onerror = () => reject(new Error("Leaflet failed to load"));
       document.body.appendChild(s);
     });
   }
   
   async function initEndMap(){
     const el = $("#leafletMap");
     if (!el) return;
   
     try{
       await loadLeaflet();
   
       // Leaflet is now available as window.L
       const map = window.L.map(el, {
         scrollWheelZoom: false,
         dragging: true,
         tap: true
       }).setView([CHURCH_LAT, CHURCH_LNG], 15);
   
       window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
         maxZoom: 19,
         attribution: '&copy; OpenStreetMap contributors'
       }).addTo(map);
   
       const marker = window.L.marker([CHURCH_LAT, CHURCH_LNG]).addTo(map);
       marker.bindPopup(`<strong>${CHURCH_LABEL}</strong><br>(${CHURCH_LAT}, ${CHURCH_LNG})`);
   
       // Optional: open popup on load
       // marker.openPopup();
   
       // Re-enable scroll zoom only after user clicks the map
       map.on("click", () => map.scrollWheelZoom.enable());
     }catch(err){
       el.innerHTML = `
         <div style="padding:16px">
           <p><strong>Map failed to load.</strong></p>
           <p class="small">If you are offline, the Leaflet CDN may be unavailable. You can still use the embedded Google map above.</p>
         </div>
       `;
     }
   }
   
   initEndMap();
   