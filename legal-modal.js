(function () {
    // 1. Inject CSS
    const css = `
        .modal {
            display: none;
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
        }
        .modal-content {
            background: #fff;
            margin: 2% auto;
            padding: 1em;
            border-radius: 12px;
            width: 90%;
            max-width: 900px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            position: relative;
            animation: modalFadeIn 0.3s ease;
        }
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .modal-content iframe {
            width: 100%;
            height: 80vh;
            border: 0;
            border-radius: 8px;
        }
        .close-modal {
            position: absolute;
            right: 15px;
            top: 10px;
            font-size: 2rem;
            cursor: pointer;
            color: #555;
            z-index: 10001;
        }
        .close-modal:hover { color: #000; }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // 2. Inject Modal HTML
    const modalDiv = document.createElement('div');
    modalDiv.id = 'legal-modal-global';
    modalDiv.className = 'modal';
    modalDiv.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <iframe id="legal-iframe-global" src=""></iframe>
        </div>
    `;
    document.body.appendChild(modalDiv);

    const modal = document.getElementById('legal-modal-global');
    const iframe = document.getElementById('legal-iframe-global');
    const closeBtn = modal.querySelector('.close-modal');

    // 3. Logic to open/close
    window.openLegalModal = function (url) {
        iframe.src = url;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    };

    window.closeLegalModal = function () {
        modal.style.display = 'none';
        iframe.src = '';
        document.body.style.overflow = 'auto';
    };

    closeBtn.onclick = closeLegalModal;
    window.onclick = function (event) {
        if (event.target == modal) {
            closeLegalModal();
        }
    };

    // 4. Transform footer links
    function updateLinks() {
        const footerLinks = document.querySelectorAll('footer a, #cookieBanner a');
        footerLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.includes('aviso-legal') || href.includes('politica-privacidad') || href.includes('politica-cookies'))) {
                link.setAttribute('data-original-href', href);
                link.setAttribute('href', 'javascript:void(0)');
                link.onclick = function (e) {
                    e.preventDefault();
                    window.openLegalModal(href);
                };
            }
        });
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateLinks);
    } else {
        updateLinks();
    }
})();
