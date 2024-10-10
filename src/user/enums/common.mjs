export const PAYMENT_GATEWAYS = {
    STRIPE: 'stripe',
    FLUTTERWAVE: 'flutterwave',
    PAYSTACK: 'paystack',
}

export const MEDIA_TYPES = {
    ANY: 'any',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    DOCUMENT: 'document',
    PDF: 'pdf',
}

export const MEDIA_TYPES_REGEXP = {
    ANY: /^/,
    IMAGE: /jpeg|jpg|png|gif|svg|webp/,
    VIDEO: /mp4|avi|mov|flv|avchd|mkv|webm/,
    AUDIO: /m4a|mp3|wav/,
    DOCUMENT: /doc|docx|pdf|odt|xlsx|xls|txt|csv|zip|rar/,
    PDF: /pdf/,
}

export const ETRANSACTION_TYPE = {
    rechargeWallet: "rechargeWallet",
    referralBonus: "referralBonus",
    bankTransfer: "bank_transfer",
    rentPayment: "rentPayment"
}
