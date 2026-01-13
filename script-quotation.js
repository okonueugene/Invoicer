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
    },
    quotationTracker: {
        prefix: "QT",
        currentNum: 1001,
        padding: 5
    }
};

function loadData() {
    const stored = localStorage.getItem('invoiceConfig');
    if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure quotation tracker exists
        if (!parsed.quotationTracker) {
            parsed.quotationTracker = defaultData.quotationTracker;
        }
        return { ...defaultData, ...parsed };
    }
    return defaultData;
}

function saveData(data) {
    localStorage.setItem('invoiceConfig', JSON.stringify(data));
}

function checkInit() {
    if (!localStorage.getItem('invoiceConfig') && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
    }
}

function getQuotationNumberString(data) {
    const tracker = data.quotationTracker || defaultData.quotationTracker;
    const numStr = tracker.currentNum.toString().padStart(tracker.padding, '0');
    return `${tracker.prefix}${numStr}`;
}

function incrementQuotationNumber() {
    let data = loadData();
    if (!data.quotationTracker) {
        data.quotationTracker = defaultData.quotationTracker;
    }
    data.quotationTracker.currentNum = parseInt(data.quotationTracker.currentNum) + 1;
    saveData(data);
    return getQuotationNumberString(data);
}

async function handleImageUpload(inputElement, callback, removeBackground = false) {
    if (!inputElement.files || !inputElement.files[0]) return;
    
    const file = inputElement.files[0];
    
    if (!removeBackground) {
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result);
        reader.readAsDataURL(file);
        return;
    }
    
    try {
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
            loadingAlert = document.createElement('div');
            loadingAlert.id = 'bg-removal-loading';
            loadingAlert.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:20px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3); z-index:9999; text-align:center;';
            loadingAlert.innerHTML = '<p style="margin:0 0 10px 0;">Removing background...</p><p style="margin:0; font-size:12px; color:#666;">This may take a few moments</p>';
            document.body.appendChild(loadingAlert);
        }
        
        const { removeBackground: removeBg } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@latest');
        
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await img.decode();
        
        const blob = await removeBg(img);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof Swal !== 'undefined') {
                Swal.close();
                Swal.fire({
                    title: 'Success!',
                    text: 'Background removed successfully',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else if (loadingAlert && loadingAlert.parentNode) {
                document.body.removeChild(loadingAlert);
            }
            
            callback(e.target.result);
        };
        reader.readAsDataURL(blob);
        
    } catch (err) {
        console.error("Error removing background:", err);
        
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

    const viewBox = isOval ? "0 0 1350 1000" : "0 0 1000 1000";
    const cx = isOval ? 675 : 500;
    const rx = isOval ? 655 : 485;
    const ry = 485;
    
    const leftStarX = isOval ? 20 : 100;
    const rightStarX = isOval ? 1330 : 900;
    
    const starPath = "M0,-21 L6,-6 L23,-6 L9,4 L14,21 L0,11 L-14,21 L-9,4 L-23,-6 L-6,-6 Z";

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

// Validation
function validateDocument() {
    const buyer = document.getElementById('buyer').value.trim();
    const validUntil = document.getElementById('validUntil').value;
    const hasItems = items.some(item => item.desc.trim() !== '' && parseFloat(item.price) > 0);

    if (!buyer) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Missing Client Details',
                text: 'Please enter client name and address',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#e67e22'
            });
        } else {
            alert('Please enter client details');
        }
        return false;
    }
    
    if (!validUntil) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Missing Validity Date',
                text: 'Please set "Valid Until" date',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#e67e22'
            });
        } else {
            alert('Please set validity date');
        }
        return false;
    }
    
    if (!hasItems) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'No Items Added',
                text: 'Please add at least one item with description and price',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#e67e22'
            });
        } else {
            alert('Please add at least one item');
        }
        return false;
    }
    
    return true;
}

function finalizeQuotation() {
    const nextNum = incrementQuotationNumber();
    document.getElementById('quoNo').value = nextNum;
    render();
}

function handlePrint() {
    if (!validateDocument()) return;
    
    const qNo = document.getElementById('quoNo').value;
    
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Ready to Print',
            text: `Quotation ${qNo} will be finalized and the number will increment`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Print Now',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#2ecc71'
        }).then((result) => {
            if (result.isConfirmed) {
                const originalTitle = document.title;
                document.title = qNo;
                window.print();
                document.title = originalTitle;
                finalizeQuotation();
                
                Swal.fire({
                    title: 'Quotation Finalized!',
                    text: `Quotation number incremented. Next quotation: ${document.getElementById('quoNo').value}`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    } else {
        const originalTitle = document.title;
        document.title = qNo;
        window.print();
        document.title = originalTitle;
        finalizeQuotation();
    }
}

function handlePDF() {
    if (!validateDocument()) return;
    
    const qNo = document.getElementById('quoNo').value;
    
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Generating PDF...',
            text: 'Please wait while we create your quotation',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const paper = document.getElementById('invoicePaper');

    html2canvas(paper, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${qNo}.pdf`);
        
        finalizeQuotation();
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'PDF Downloaded!',
                text: `Quotation ${qNo} saved. Next quotation: ${document.getElementById('quoNo').value}`,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#2ecc71'
            });
        }
    }).catch((error) => {
        console.error('PDF generation error:', error);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'PDF Generation Failed',
                text: 'There was an error creating the PDF. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } else {
            alert('PDF generation failed. Please try again.');
        }
    });
}

function render() {
    document.getElementById('p_no').textContent = document.getElementById('quoNo').value;
    document.getElementById('p_date').textContent = new Date(document.getElementById('quoDate').value).toLocaleDateString('en-GB');
    document.getElementById('p_acc').textContent = document.getElementById('accNo').value;
    document.getElementById('p_vendorPin').textContent = document.getElementById('pinNo').value;
    
    document.getElementById('p_buyer').textContent = document.getElementById('buyer').value;
    document.getElementById('p_clientPin').textContent = document.getElementById('buyerPin').value;
    document.getElementById('p_terms').textContent = document.getElementById('terms').value;
    document.getElementById('p_po').textContent = document.getElementById('poNo').value;
    
    const validDate = document.getElementById('validUntil').valueAsDate;
    document.getElementById('p_valid').textContent = validDate ? validDate.toLocaleDateString('en-GB') : '';
    
    document.getElementById('p_footer').textContent = document.getElementById('footerText').value;

    const tbody = document.getElementById('p_tbody');
    tbody.innerHTML = '';
    const isInclusive = document.getElementById('vatMode').value === 'inclusive';
    
    let mathSubtotal = 0;
    let mathVat = 0;
    let mathTotal = 0;

    items.forEach((item) => {
        let displayRate = item.price;
        let lineTotal = 0;
        if (isInclusive) {
            displayRate = item.price / 1.16;
            lineTotal = displayRate * item.qty;
        } else {
            lineTotal = item.price * item.qty;
        }
        mathSubtotal += lineTotal;
        
        tbody.innerHTML += `
        <tr>
            <td>${item.desc}</td>
            <td class="text-right">${item.qty}</td>
            <td class="text-right">${item.um}</td>
            <td class="text-right">${displayRate.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
            <td class="text-right">${lineTotal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
        </tr>`;
    });

    mathVat = mathSubtotal * 0.16;
    mathTotal = mathSubtotal + mathVat;

    for(let i=items.length; i<5; i++) tbody.innerHTML += `<tr><td style="height:30px;"></td><td></td><td></td><td></td><td></td></tr>`;

    const fmt = n => "KES " + n.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('p_sub').textContent = fmt(mathSubtotal);
    document.getElementById('p_vat').textContent = fmt(mathVat);
    document.getElementById('p_total').textContent = fmt(mathTotal);
    document.getElementById('p_balance').textContent = fmt(mathTotal);

    document.getElementById('p_stamp').innerHTML = getStampSVG(settings.stamp, document.getElementById('quoDate').value);
}

function renderEditor() {
    const list = document.getElementById('itemsList');
    list.innerHTML = '';
    items.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'row';
        div.style.background = '#f9f9f9'; div.style.padding='5px'; div.style.marginBottom='5px';
        div.innerHTML = `
            <div style="flex:3"><input type="text" value="${item.desc}" oninput="items[${i}].desc=this.value; render()" placeholder="Desc"></div>
            <div style="flex:1"><input type="number" value="${item.qty}" oninput="items[${i}].qty=this.value; render()" placeholder="Qty"></div>
            <div style="flex:1"><input type="text" value="${item.um}" oninput="items[${i}].um=this.value; render()" placeholder="U/M"></div>
            <div style="flex:2"><input type="number" value="${item.price}" oninput="items[${i}].price=this.value; render()" placeholder="Rate"></div>
            <button class="btn-danger" onclick="items.splice(${i},1); renderEditor(); render()" style="width:auto; height:36px; margin-top:0;">x</button>
        `;
        list.appendChild(div);
    });
}

window.addItem = () => { items.push({desc:"", qty:1, um:"Pcs", price:0}); renderEditor(); render(); };