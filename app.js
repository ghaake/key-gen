async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand("copy");
    } finally {
        document.body.removeChild(ta);
    }
}

function getTextFromTarget(selector) {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`No element matches ${selector}`);
    return el.matches("input,textarea")
        ? el.value
        : (el.textContent || "").trim();
}

async function copyText() {
    const label = document.querySelector("#label");
    const text = getTextFromTarget("#keyDisplay");
    try {
        await copyTextToClipboard(text);
        label.textContent = "Key copied to clipboard.";
    } catch (err) {
        console.error(err);
        label.textContent = "Could not copy key!";
    }
}

function generateTotpSecret(length = 20) {
    let bytes;
    if (typeof window !== "undefined" && window.crypto) {
        bytes = new Uint8Array(length);
        window.crypto.getRandomValues(bytes);
    } else {
        bytes = require("crypto").randomBytes(length);
    }

    return base32Encode(bytes).replace(/=+$/, "");
}

function base32Encode(bytes) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = 0,
        value = 0,
        output = "";

    for (let i = 0; i < bytes.length; i++) {
        value = (value << 8) | bytes[i];
        bits += 8;
        while (bits >= 5) {
            output += alphabet[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) {
        output += alphabet[(value << (5 - bits)) & 31];
    }

    while (output.length % 8 !== 0) {
        output += "=";
    }
    return output;
}

function generateKey(length, type) {
    const hexChars = "0123456789ABCDEF";
    const alphaChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const numChars = "0123456789";
    const alphaNumChars = alphaChars + numChars;
    const lowerAlphaChars = "abcdefghijklmnopqrstuvwxyz";
    const upperAlphaChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const specialChars = "!@#$%^&*()_+-=[]{}|;:'\",.<>/?";
    const mixedCaseNumChars = alphaNumChars;
    const customChars = alphaChars + numChars + specialChars;

    let charsToUse;

    switch (type) {
        case "hex":
            charsToUse = hexChars;
            break;
        case "alphanumeric":
            charsToUse = alphaNumChars;
            break;
        case "alphabetic":
            charsToUse = alphaChars;
            break;
        case "numeric":
            charsToUse = numChars;
            break;
        case "lowercase":
            charsToUse = lowerAlphaChars;
            break;
        case "uppercase":
            charsToUse = upperAlphaChars;
            break;
        case "special":
            charsToUse = specialChars;
            break;
        case "mixedCaseNum":
            charsToUse = mixedCaseNumChars;
            break;
        case "custom":
            charsToUse = customChars;
            break;
        case "totp":
            return generateTotpSecret(length);
        default:
            console.error("Unsupported key type");
            return null;
    }

    let key = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charsToUse.length);
        key += charsToUse[randomIndex];
    }

    return key;
}

function generateAndDisplayKey() {
    const length = document.getElementById("keyLength").value;
    const type = document.getElementById("keyType").value;
    const key = generateKey(parseInt(length, 10), type);
    document.getElementById("keyDisplay").textContent = `${key}`;
    document.querySelector("#label").textContent = "";
}

window.generateAndDisplayKey = generateAndDisplayKey;
window.copyText = copyText;