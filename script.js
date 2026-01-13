const defaultData = {
    company: {
        name: "McDave Holdings Ltd",
        address: "info@mcdave.co.ke\nP.O Box 86089-00200, Nairobi\nEnterprise road, Inside Zenith steel",
        brandName: "McDave®",
        logo: "", 
        logoWidth: "100",
        signature: "",
        signatureX: "0"
    },
    visuals: {
        themeColor: "#2ecc71",
        titleColor: "#c0392b",
        textColor: "#333333"
    },
    stamp: {
        show: "true",
        top: "McDAVE HOLDINGS LTD",
        bottom: "OFFICIAL STAMP",
        email: "info@mcdave.co.ke",
        phone: "+254 700 000 000",
        ink: "#4a7ba7",
        dateInk: "#d63230",
        shape: "circle"
    },
    tracker: {
        prefix: "MC",
        currentNum: 7421,
        padding: 5
    }
};

function loadData() {
    const stored = localStorage.getItem('invoiceConfig');
    return stored ? { ...defaultData, ...JSON.parse(stored) } : defaultData;
}

function saveData(data) {
    localStorage.setItem('invoiceConfig', JSON.stringify(data));
}

function saveAndRedirect(data) {
    saveData(data);
    
    // Check if SweetAlert2 (Swal) is available
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Settings Saved!',
            text: 'Your invoice settings have been saved successfully.',
            icon: 'success',
            confirmButtonText: 'Go to Invoice Editor',
            confirmButtonColor: '#2ecc71'
        }).then(() => {
            window.location.href = 'invoice.html';
        });
    } else {
        // Fallback to regular alert if SweetAlert is not loaded
        alert("Settings Saved!");
        window.location.href = 'invoice.html';
    }
}

function checkInit() {
    if (!localStorage.getItem('invoiceConfig') && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
    }
}

function getInvoiceNumberString(data) {
    const numStr = data.tracker.currentNum.toString().padStart(data.tracker.padding, '0');
    return `${data.tracker.prefix}${numStr}`;
}

function incrementInvoiceNumber() {
    const data = loadData();
    data.tracker.currentNum = parseInt(data.tracker.currentNum) + 1;
    saveData(data);
    return getInvoiceNumberString(data);
}

async function handleImageUpload(inputElement, callback, removeBackground = false) {
    if (!inputElement.files || !inputElement.files[0]) return;
    
    const file = inputElement.files[0];
    
    if (!removeBackground) {
        // Standard upload without background removal
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result);
        reader.readAsDataURL(file);
        return;
    }
    
    // Background removal flow
    try {
        // Show loading with SweetAlert if available, otherwise use custom div
        let loadingAlert;
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Removing Background...',
                html: 'This may take 10-30 seconds depending on image size.',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        } else {
            // Fallback loading indicator
            loadingAlert = document.createElement('div');
            loadingAlert.id = 'bg-removal-loading';
            loadingAlert.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:20px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3); z-index:9999; text-align:center;';
            loadingAlert.innerHTML = '<p style="margin:0 0 10px 0;">Removing background...</p><p style="margin:0; font-size:12px; color:#666;">This may take a few moments</p>';
            document.body.appendChild(loadingAlert);
        }
        
        // Dynamically import the background removal library
        const { removeBackground: removeBg } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@latest');
        
        // Load and process image
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await img.decode();
        
        // Remove background (returns a Blob)
        const blob = await removeBg(img);
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            // Close loading indicator
            if (typeof Swal !== 'undefined') {
                Swal.close();
            } else if (loadingAlert && loadingAlert.parentNode) {
                document.body.removeChild(loadingAlert);
            }
            
            // Success message
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Success!',
                    text: 'Background removed successfully',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            
            callback(e.target.result);
        };
        reader.readAsDataURL(blob);
        
    } catch (err) {
        console.error("Error removing background:", err);
        
        // Close loading and show error
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Background Removal Failed',
                text: 'Using original image instead.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        } else {
            alert("Background removal failed. Using original image instead.");
            const loadingAlert = document.getElementById('bg-removal-loading');
            if (loadingAlert) document.body.removeChild(loadingAlert);
        }
        
        // Fallback to normal upload
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result);
        reader.readAsDataURL(file);
    }
}

function getStampSVG(config, dateStr) {
    if (config.show === "false") return "";
    
    const d = dateStr ? new Date(dateStr) : new Date();
    const dateTxt = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const isOval = config.shape === 'oval';
    
    const phoneTxt = config.phone ? `Tel: ${config.phone}` : "";
    const emailTxt = config.email ? config.email.toLowerCase() : "";

    // Adjust viewBox width for oval to make it wider
    const viewBox = isOval ? "0 0 1350 1000" : "0 0 1000 1000";
    const cx = isOval ? 675 : 500; // Center x for oval
    const rx = isOval ? 655 : 485; // Horizontal radius for ellipse
    const ry = 485; // Vertical radius (same for both)
    
    // Star positions
    const leftStarX = isOval ? 20 : 100;
    const rightStarX = isOval ? 1330 : 900;
    
    const starPath = "M0,-21 L6,-6 L23,-6 L9,4 L14,21 L0,11 L-14,21 L-9,4 L-23,-6 L-6,-6 Z";

    // For oval, we need to adjust the arc paths to be wider
    const topArcPath = isOval 
        ? `M${cx - rx + 100},500 A${rx - 100},${ry - 100} 0 0,1 ${cx + rx - 100},500`
        : "M100,500 A400,400 0 0,1 900,500";
    
    const bottomArcPath = isOval
        ? `M${cx - rx + 100},500 A${rx - 100},${ry - 100} 0 1,0 ${cx + rx - 100},500`
        : "M100,500 A400,400 0 1,0 900,500";

    return `
    <svg viewBox="${viewBox}" style="width:100%; height:100%;">
        <defs>
            <path id="topArc" d="${topArcPath}" />
            <path id="bottomArc" d="${bottomArcPath}" />
        </defs>

        <ellipse cx="${cx}" cy="500" rx="${rx}" ry="${ry}" fill="none" stroke="${config.ink}" stroke-width="20" />
        <ellipse cx="${cx}" cy="500" rx="${rx - 25}" ry="${ry - 25}" fill="none" stroke="${config.ink}" stroke-width="15" />
        <ellipse cx="${cx}" cy="500" rx="${rx - 145}" ry="${ry - 145}" fill="none" stroke="${config.ink}" stroke-width="15" />

        <g fill="${config.ink}">
            <g transform="translate(${leftStarX},500)">
                <path d="${starPath}" />
            </g>
            <g transform="translate(${rightStarX},500)">
                <path d="${starPath}" />
            </g>
        </g>

        <text font-size="58" font-weight="bold" fill="${config.ink}" text-anchor="middle" letter-spacing="5">
            <textPath href="#topArc" startOffset="50%">${config.top.toUpperCase()}</textPath>
        </text>

        <text font-size="58" font-weight="bold" fill="${config.ink}" text-anchor="middle" letter-spacing="5">
            <textPath href="#bottomArc" startOffset="50%">${config.bottom.toUpperCase()}</textPath>
        </text>

        <text x="${cx}" y="490" font-size="72" font-weight="bold" fill="${config.dateInk}" text-anchor="middle" dominant-baseline="middle" font-family="Courier New, monospace">
            ${dateTxt}
        </text>

        <text x="${cx}" y="560" font-size="32" font-weight="bold" fill="${config.ink}" text-anchor="middle" dominant-baseline="middle" font-family="Segoe UI, sans-serif">
            ${emailTxt}
        </text>
        <text x="${cx}" y="600" font-size="32" font-weight="bold" fill="${config.ink}" text-anchor="middle" dominant-baseline="middle" font-family="Segoe UI, sans-serif">
            ${phoneTxt}
        </text>
    </svg>`;
}