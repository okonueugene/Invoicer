const defaultData = {
    company: {
        name: "McDave Holdings Ltd",
        address: "info@mcdave.co.ke\nP.O Box 86089-00200, Nairobi\nEnterprise road, Inside Zenith steel",
        brandName: "McDave®",
        logo: "", 
        logoWidth: "100",
        signature: "",
        signatureX: "0" // NEW: Default offset 0px
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
    alert("Settings Saved!");
    window.location.href = 'invoice.html';
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

function handleImageUpload(inputElement, callback) {
    if (inputElement.files && inputElement.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result);
        reader.readAsDataURL(inputElement.files[0]);
    }
}

function getStampSVG(config, dateStr) {
    if (config.show === "false") return "";
    const d = dateStr ? new Date(dateStr) : new Date();
    const dateTxt = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const scaleX = config.shape === 'oval' ? 1.35 : 1;
    const phoneTxt = config.phone ? `Tel: ${config.phone}` : "";

    return `
    <svg viewBox="0 0 1000 1000" style="width:100%; height:100%; transform: scaleX(${scaleX}); transform-origin: left center;">
        <defs>
            <path id="topArc" d="M100,500 A400,400 0 0,1 900,500" />
            <path id="bottomArc" d="M100,500 A400,400 0 1,0 900,500" />
        </defs>
        <circle cx="500" cy="500" r="480" fill="none" stroke="${config.ink}" stroke-width="20" />
        <circle cx="500" cy="500" r="450" fill="none" stroke="${config.ink}" stroke-width="15" />
        <circle cx="500" cy="500" r="340" fill="none" stroke="${config.ink}" stroke-width="15" />
        <text font-size="60" font-weight="bold" fill="${config.ink}" text-anchor="middle" letter-spacing="5">
            <textPath href="#topArc" startOffset="50%">${config.top.toUpperCase()}</textPath>
        </text>
        <text font-size="60" font-weight="bold" fill="${config.ink}" text-anchor="middle" letter-spacing="5">
            <textPath href="#bottomArc" startOffset="50%">${config.bottom.toUpperCase()}</textPath>
        </text>
        <text x="500" y="520" font-size="75" font-weight="bold" fill="${config.dateInk}" text-anchor="middle" dominant-baseline="middle" font-family="Courier New, monospace">
            ${dateTxt}
        </text>
        <text x="500" y="610" font-size="35" font-weight="bold" fill="${config.ink}" text-anchor="middle" dominant-baseline="middle" font-family="Segoe UI, sans-serif">
            ${phoneTxt}
        </text>
    </svg>`;
}