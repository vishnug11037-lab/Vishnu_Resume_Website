document.addEventListener('DOMContentLoaded', () => {

    /* =========================
       Smooth Scroll Nav Dots
       ========================= */
    const sections = document.querySelectorAll('.resume-section, .resume-header');
    const navDots = document.querySelectorAll('.nav-dot');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Adjust offset to trigger slightly before the section hits top
            if (scrollY >= (sectionTop - 300)) {
                current = section.getAttribute('id');
            }
        });

        navDots.forEach(dot => {
            // Only anchor tags have an href to check against
            if (dot.tagName === 'A' && dot.hasAttribute('href')) {
                dot.classList.remove('active');
                const href = dot.getAttribute('href');
                if (current && href.includes(current)) {
                    dot.classList.add('active');
                } else if (!current && href === '#header') {
                    // Default to first item if we are at the very top
                    dot.classList.add('active');
                }
            }
        });
    });

    /* =========================
       Expandable Experience Sections
       ========================= */
    const expandables = document.querySelectorAll('.expandable');

    expandables.forEach(item => {
        const header = item.querySelector('.toggle-exp');
        
        header.addEventListener('click', () => {
            // Toggle the current item
            const isExpanded = item.classList.contains('expanded');
            
            // Optional: Close others (accordion style)
            // expandables.forEach(el => el.classList.remove('expanded'));
            
            if (!isExpanded) {
                item.classList.add('expanded');
            } else {
                item.classList.remove('expanded');
            }
        });
    });

    /* =========================
       Scroll Animations (Observer)
       ========================= */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    // Observer for fade-up sections
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => sectionObserver.observe(el));

    // Observer specifically for animating skill tags popping in
    const skillsSection = document.getElementById('skills');
    const skillTags = document.querySelectorAll('.skill-tag');

    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                skillTags.forEach(tag => tag.classList.add('animate-in'));
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (skillsSection) {
        skillsObserver.observe(skillsSection);
    }

    /* =========================
       Dark/Light Theme Toggle
       ========================= */
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn.querySelector('i');
    
    // Check saved preference
    const savedTheme = localStorage.getItem('resumeTheme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-theme');
        themeIcon.className = 'bx bx-sun';
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        
        // Update Icon
        themeIcon.className = isDark ? 'bx bx-sun' : 'bx bx-moon';
        
        // Save preference
        localStorage.setItem('resumeTheme', isDark ? 'dark' : 'light');
    });

    /* =========================
       Animated Download & Preview Modal
       ========================= */
    const downloadBtn = document.getElementById('download-btn');
    const downloadText = downloadBtn.querySelector('.btn-text');
    
    const pdfModal = document.getElementById('pdf-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalDownloadBtn = document.getElementById('modal-download-btn');
    const pdfPreviewFrame = document.getElementById('pdf-preview-frame');
    
    let currentPdfUrl = null;

    // Close Modal Event
    modalCloseBtn.addEventListener('click', () => {
        pdfModal.classList.remove('active');
        // Clear iframe to free memory after animation finishes
        setTimeout(() => {
            if (!pdfModal.classList.contains('active')) {
                pdfPreviewFrame.src = '';
            }
        }, 300);
    });

    // Download from Modal Event
    modalDownloadBtn.addEventListener('click', () => {
        if (currentPdfUrl) {
            const link = document.createElement('a');
            link.href = currentPdfUrl;
            link.download = 'Vishnu_Gireesh_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

    // Main Floating Button Click (Generate & Preview)
    downloadBtn.addEventListener('click', () => {
        // Prevent double clicks
        if (downloadBtn.classList.contains('flipping')) return;

        // Start animation
        downloadBtn.classList.add('flipping');
        downloadText.textContent = "Generating...";

        // Wait for CSS animation (1.2s total), trigger generation afterwards
        setTimeout(() => {
            
            // Extract the resume container content
            const resumeElement = document.getElementById('resume-container');
            const clone = resumeElement.cloneNode(true);
            
            // Remove any scroll transforms, padding, or shadows that might offset it in the render
            clone.style.transform = 'none';
            clone.style.boxShadow = 'none';
            clone.style.margin = '0';
            clone.style.padding = '0';
            
            // Remove interactive UI elements
            const elementsToRemove = clone.querySelectorAll('.paper-texture, i, .bx, .toggle-icon');
            elementsToRemove.forEach(el => el.remove());
            
            // Force expand any accordion elements so all text is visible in the PDF
            const detailsList = clone.querySelectorAll('.exp-details');
            detailsList.forEach(el => {
                el.style.maxHeight = 'none';
                el.style.opacity = '1';
                el.style.padding = '0';
            });
            
            // Apply exact styling for the PDF export to match original look
            const pdfContainer = document.createElement('div');
            pdfContainer.innerHTML = clone.innerHTML;
            
            // We use inline styles wrapper to force formatting in html2pdf
            const styledWrapper = document.createElement('div');
            styledWrapper.innerHTML = `
                <style>
                    /* Force Light Mode / Paper Layout */
                    .pdf-wrap * { color: #000 !important; opacity: 1 !important; transform: none !important; box-sizing: border-box !important; text-decoration: none !important; } /* Global reset for the PDF */
                    .pdf-wrap a, .pdf-wrap u { text-decoration: none !important; } /* Remove all link underlines */
                    .pdf-wrap { font-family: 'Calibri', 'Arial', sans-serif; font-size: 10.5pt; padding: 0; margin: 0; background: #fff !important; line-height: 1.4; text-align: justify; width: 100%; max-width: 100%; overflow-wrap: break-word; }
                    .pdf-wrap h1 { font-family: 'Calibri', 'Arial', sans-serif; font-size: 15pt; font-weight: bold; text-align: center; margin-top: 0; margin-bottom: 2px; border: none !important; border-bottom: none !important; text-decoration: none !important; padding: 0; letter-spacing: 0; }
                    .pdf-wrap .name-reveal::after { display: none !important; } /* Hide animated underline */
                    .pdf-wrap .contact-bar { text-align: center; font-size: 9.5pt; margin-bottom: 15px; display: block; }
                    .pdf-wrap .contact-btn { text-decoration: none; padding: 0; display: inline; }
                    .pdf-wrap .separator { padding: 0 5px; }
                    .pdf-wrap h2.section-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000 !important; margin-top: 10px; margin-bottom: 8px; padding-bottom: 2px; }
                    .pdf-wrap strong { font-weight: bold; }
                    
                    /* Education */
                    .pdf-wrap .edu-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .pdf-wrap .edu-primary { display: inline-block; }
                    .pdf-wrap .edu-date { float: right; }
                    
                    /* Skills */
                    .pdf-wrap .skill-group { margin-bottom: 6px; display: flex; flex-direction: row; }
                    .pdf-wrap .skill-category { width: 140px; font-weight: bold; }
                    .pdf-wrap .skill-tags { display: inline; }
                    .pdf-wrap .skill-tag { background: none; border: none; padding: 0; font-size: 11pt; color: #000; font-weight: normal; margin-right: 5px; }
                    .pdf-wrap .skill-tag::after { content: ', '; }
                    .pdf-wrap .skill-tag:last-child::after { content: ''; }
                    
                    /* Experience */
                    .pdf-wrap .exp-item { margin-bottom: 15px; border: none !important; background: transparent !important; box-shadow: none !important; padding: 0 !important; }
                    .pdf-wrap .exp-header { display: flex; justify-content: space-between; margin-bottom: 2px; padding: 0 !important; cursor: default; }
                    .pdf-wrap .exp-role { display: inline-block; font-weight: bold; color: #000 !important; }
                    .pdf-wrap .exp-company { display: block; font-weight: normal; color: #000 !important; margin-bottom: 6px; padding-left: 0; }
                    .pdf-wrap .exp-role span { align-self: auto; display: block;}
                    .pdf-wrap .exp-date { float: right; padding-right: 0; color: #000 !important; font-weight: normal; }
                    
                    .pdf-wrap ul { margin: 0 0 10px 30px; padding: 0; list-style-type: circle; color: #000; }
                    .pdf-wrap li { margin-bottom: 4px; padding-left: 5px; }
                    
                    /* Projects */
                    .pdf-wrap .project-card { border: none; padding: 0; margin-bottom: 15px; background: none; box-shadow: none; }
                    .pdf-wrap .project-card::before { display: none; }
                    .pdf-wrap .project-tech-stack { display: none; }
                    .pdf-wrap .p-client, .pdf-wrap .p-date { display: inline-block; }
                    .pdf-wrap .p-date { float: right; }
                    .pdf-wrap .project-role-title { font-weight: bold; margin-bottom: 4px; margin-top: 5px; }
                    
                    /* Extra-curricular */
                    .pdf-wrap .activities-row { display: block; }
                    .pdf-wrap .activity-chip { display: inline; background: none; border: none; padding: 0; color: #000; font-weight: normal; }
                    .pdf-wrap .activity-chip::after { content: ', '; }
                    .pdf-wrap .activity-chip:last-child::after { content: ''; }
                    
                    /* Page Break Rules */
                    .pdf-wrap p, .pdf-wrap li, .pdf-wrap .skill-group, .pdf-wrap .exp-item, .pdf-wrap .project-card, .pdf-wrap .edu-row { page-break-inside: avoid; margin-bottom: 8px; }
                </style>
                <div class="pdf-wrap">${pdfContainer.innerHTML}</div>
            `;
            
            // Generate PDF options
            const opt = {
                margin:       [10, 10, 10, 10], // top, right, bottom, left
                filename:     'Vishnu_Gireesh_Resume.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, scrollY: 0, windowWidth: document.documentElement.offsetWidth },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak:    { mode: ['css', 'legacy'] }
            };
            
            // Generate and open the PDF in the preview modal
            html2pdf().from(styledWrapper).set(opt).outputPdf('blob').then((pdfBlob) => {
                // Create URL and store globally
                if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl); // cleanup previous
                currentPdfUrl = URL.createObjectURL(pdfBlob);
                
                // Show modal and assign iframe
                pdfPreviewFrame.src = currentPdfUrl;
                pdfModal.classList.add('active');
                
                // Revert floating button state
                downloadBtn.classList.remove('flipping');
                downloadText.textContent = "Download Resume";
            });
            
        }, 1200); // 1.2s matches the CSS animation duration
    });
});
