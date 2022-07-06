import axios from "axios";

export const isLocal = false;
export const mainURL = isLocal ? "http://192.168.0.101:8090/requisitionws/" : "http://15.184.94.83:8080/requisitionws/";
export const vapidKey = "BLtM48Bz94eGW29IbYBO8D2LNiGWcZWEYOxYAnyZxqA1Jk9CrdZok_MNm35WapJsKRP0SFDX_9KTrCF8jyqoZEg";
export const sessionKeys = {
    connectionString: "CONNECTION_STRING",
    dbName: "DB_NAME",
    loginUserId: "LOGIN_USERID",
    loginUserObj: "LOGIN_USEROBJ",
    loginUserRoleList: "LOGIN_USER_ROLE_LIST",
    authToken: "AUTH_TOKEN",
    companyObj: "COMPANY_OBJ",
    projectObj: "PROJECT_OBJ",
    deviceToken: "DEVICE_TOKEN"
}

export const ApiHelper = async (suffixURL, reqObj, methodType, showUrl, showReqObj, showRespObj) => {
    try {
        if (showUrl) {
            console.log("URL ---> " + (mainURL + suffixURL));
        }
        if (showReqObj) {
            console.log("Request ---> " + JSON.stringify(reqObj));
        }
        let response = await fetch(mainURL + suffixURL, {
            method: methodType,
            cache: "no-cache",
            mode: "cors",
            withCredentials: true,
            credentials: "include",
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', authToken: sessionStorage.getItem(sessionKeys.authToken) },
            body: JSON.stringify(reqObj)
        })
        let json = await response.json();
        if (showRespObj) {
            console.log("Response: " + JSON.stringify(json));
        }
        return json;
    } catch (error) {
        console.error(error);
        return { result: [], status: "Error: " + error };
    }
};

export const ApiHelper2 = async (suffixURL, reqObj, methodType, showUrl, showReqObj, showResObj, useLocalURL) => {
    let headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authToken: sessionStorage.getItem(sessionKeys.authToken)
    }
    let url = "";
    if (useLocalURL) {
        url = "http://192.168.0.101:8090/requisitionws/" + suffixURL;
    } else {
        url = mainURL + suffixURL;
    }
    if (showUrl) {
        console.log("URL ---> " + url);
    }

    let requestObj = {
        ...reqObj,
        userId: sessionStorage.getItem(sessionKeys.loginUserId),
        authToken: sessionStorage.getItem(sessionKeys.authToken),
    }
    if (showReqObj) {
        console.log("Request Object ---> " + JSON.stringify(requestObj));
    }

    if (methodType === "GET") {
        return axios.get(url).then(res => res.data).then(data => {
            if (showResObj) {
                console.log("Response: " + JSON.stringify(data));
            }
            return data;
        });
    } else {
        return axios.post(url, requestObj, { headers: headers }).then(res => res.data).then(data => {
            if (showResObj) {
                console.log("Response: " + JSON.stringify(data));
            }
            return data;
        });
    }
};

export const ApiHelper3 = async (suffixURL, reqObj, methodType, showUrl, showReqObj, showResObj, loginUserId, authToken) => {
    let headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authToken: authToken
    }
    if (showUrl) {
        console.log("URL ---> " + (mainURL + suffixURL));
    }
    let requestObj = {
        ...reqObj,
        userId: loginUserId,
        authToken: authToken,
    }
    if (showReqObj) {
        console.log("Request Object ---> " + JSON.stringify(requestObj));
    }
    if (methodType === "GET") {
        return axios.get(mainURL + suffixURL).then(res => res.data).then(data => {
            if (showResObj) {
                console.log("Response: " + JSON.stringify(data));
            }
            return data;
        });
    } else {
        return axios.post((mainURL + suffixURL), requestObj, { headers: headers }).then(res => res.data).then(data => {
            if (showResObj) {
                console.log("Response: " + JSON.stringify(data));
            }
            return data;
        });
    }
};

export const reqObjectObj = {
    "formType": [
        {
            "title": "Reimbursment",
            "key": "forReimbursment",
            "isSelected": false
        },
        {
            "title": "Requisition",
            "key": "forRequisition",
            "isSelected": true
        }
    ],
    "companyObj": {
        "id": "61e17ad346dc542f1972b100",
        "companyName": "Spartan Fitness",
        "shortCode": "SF",
        "companyAddress": "Manama",
        "vatNumber": "TCXMS123456789",
        "contactPersonName": "David",
        "emailId": "david@spartan.com",
        "mobileNumber": "32002566",
        "imageURL": "http://192.168.1.74/companyLogos/spartan-fitness.png",
        "logoBase64": "",
        "isProjectAddedAndActive": true,
        "shouldBypassPurchaseDepartment": true,
        "statusObj": {
            "id": "617663fed4572eb6d275b474",
            "statusName": "Active",
            "forUsers": true,
            "forPayment": false,
            "forRequisition": false
        },
        "createdBy": null,
        "createdDate": "2022-01-14T13:29:55.866+0000"
    },
    "departments": [
        {
            "id": "61f3de977148fc323565c6f1",
            "departmentName": "Retail",
            "departmentCode": "RTL",
            "statusObj": {
                "id": "617663fed4572eb6d275b474",
                "statusName": "Active",
                "forUsers": true,
                "forPayment": false,
                "forRequisition": false
            },
            "companyObj": {
                "id": "61e17ad346dc542f1972b100",
                "companyName": "Spartan Fitness",
                "shortCode": "SF",
                "companyAddress": "Manama",
                "vatNumber": "TCXMS123456789",
                "contactPersonName": "David",
                "emailId": "david@spartan.com",
                "mobileNumber": "32002566",
                "imageURL": "http://192.168.1.74/companyLogos/spartan-fitness.png",
                "logoBase64": "",
                "isProjectAddedAndActive": true,
                "shouldBypassPurchaseDepartment": true,
                "statusObj": {
                    "id": "617663fed4572eb6d275b474",
                    "statusName": "Active",
                    "forUsers": true,
                    "forPayment": false,
                    "forRequisition": false
                },
                "createdBy": null,
                "createdDate": "2022-01-14T13:29:55.866+0000"
            }
        }
    ],
    "projects": [
        {
            "id": "61f266ce32a04a3eed511161",
            "projectTitle": "SF Kitchen",
            "projectCode": "XI134",
            "companyObj": {
                "id": "61e17ad346dc542f1972b100",
                "companyName": "Spartan Fitness",
                "shortCode": "SF",
                "companyAddress": "Manama",
                "vatNumber": "TCXMS123456789",
                "contactPersonName": "David",
                "emailId": "david@spartan.com",
                "mobileNumber": "32002566",
                "imageURL": "http://192.168.1.74/companyLogos/spartan-fitness.png",
                "logoBase64": "",
                "isProjectAddedAndActive": true,
                "shouldBypassPurchaseDepartment": true,
                "statusObj": {
                    "id": "617663fed4572eb6d275b474",
                    "statusName": "Active",
                    "forUsers": true,
                    "forPayment": false,
                    "forRequisition": false
                },
                "createdBy": null,
                "createdDate": "2022-01-14T13:29:55.866+0000"
            },
            "statusObj": {
                "id": "617663fed4572eb6d275b474",
                "statusName": "Active",
                "forUsers": true,
                "forPayment": false,
                "forRequisition": false
            },
            "createdBy": null,
            "createdDate": "2022-01-02T21:00:00.000+0000",
            "completedDate": null,
            "isRetention": null,
            "retentionDate": null
        },
        {
            "id": "61f2678032a04a3eed511162",
            "projectTitle": "SF Gym",
            "projectCode": "XI135",
            "companyObj": {
                "id": "61e17ad346dc542f1972b100",
                "companyName": "Spartan Fitness",
                "shortCode": "SF",
                "companyAddress": "Manama",
                "vatNumber": "TCXMS123456789",
                "contactPersonName": "David",
                "emailId": "david@spartan.com",
                "mobileNumber": "32002566",
                "imageURL": "http://192.168.1.74/companyLogos/spartan-fitness.png",
                "logoBase64": "",
                "isProjectAddedAndActive": true,
                "shouldBypassPurchaseDepartment": true,
                "statusObj": {
                    "id": "617663fed4572eb6d275b474",
                    "statusName": "Active",
                    "forUsers": true,
                    "forPayment": false,
                    "forRequisition": false
                },
                "createdBy": null,
                "createdDate": "2022-01-14T13:29:55.866+0000"
            },
            "statusObj": {
                "id": "617663fed4572eb6d275b474",
                "statusName": "Active",
                "forUsers": true,
                "forPayment": false,
                "forRequisition": false
            },
            "createdBy": null,
            "createdDate": "2022-01-26T21:00:00.000+0000",
            "completedDate": null,
            "isRetention": null,
            "retentionDate": null
        }
    ],
    "suppliers": [
        {
            "id": "61f2a73558fa516987c73def",
            "vendorCode": "HCN",
            "supplierName": "HSN",
            "contactPersonName": "HCN",
            "emailId": "support@hcn.com",
            "mobileNumber": "32002566",
            "address": "10-3-282/2/2, 2 nd floor, above Zee cabs\nHumayunnagar, Mehdipatnam",
            "vatNumber": "TXN123456789",
            "projectObj": {
                "id": "61f2678032a04a3eed511162",
                "projectTitle": "SF Gym",
                "projectCode": "XI135",
                "companyObj": {
                    "id": "61e17ad346dc542f1972b100",
                    "companyName": "Spartan Fitness",
                    "shortCode": "SF",
                    "companyAddress": "Manama",
                    "vatNumber": "TCXMS123456789",
                    "contactPersonName": "David",
                    "emailId": "david@spartan.com",
                    "mobileNumber": "32002566",
                    "imageURL": "http://192.168.1.74/companyLogos/spartan-fitness.png",
                    "logoBase64": "",
                    "isProjectAddedAndActive": true,
                    "shouldBypassPurchaseDepartment": true,
                    "statusObj": {
                        "id": "617663fed4572eb6d275b474",
                        "statusName": "Active",
                        "forUsers": true,
                        "forPayment": false,
                        "forRequisition": false
                    },
                    "createdBy": null,
                    "createdDate": "2022-01-14T13:29:55.866+0000"
                },
                "statusObj": {
                    "id": "617663fed4572eb6d275b474",
                    "statusName": "Active",
                    "forUsers": true,
                    "forPayment": false,
                    "forRequisition": false
                },
                "createdBy": null,
                "createdDate": "2022-01-26T21:00:00.000+0000",
                "completedDate": null,
                "isRetention": null,
                "retentionDate": null
            },
            "transferTypeObj": [
                {
                    "id": "61e293e7d22ce050b6147d78",
                    "transferTypeName": "Online",
                    "fieldsRequired": true,
                    "fields": [
                        {
                            "fieldName": "Beneficiary Name",
                            "fieldValue": null,
                            "isFieldMandatory": true
                        },
                        {
                            "fieldName": "IBAN or A/C Number",
                            "fieldValue": null,
                            "isFieldMandatory": true
                        },
                        {
                            "fieldName": "Beneficiary Address",
                            "fieldValue": null,
                            "isFieldMandatory": true
                        },
                        {
                            "fieldName": "Bank Name",
                            "fieldValue": null,
                            "isFieldMandatory": true
                        },
                        {
                            "fieldName": "Bank Address",
                            "fieldValue": null,
                            "isFieldMandatory": true
                        },
                        {
                            "fieldName": "Swift Code",
                            "fieldValue": null,
                            "isFieldMandatory": true
                        },
                        {
                            "fieldName": "Clearing Code",
                            "fieldValue": null,
                            "isFieldMandatory": false
                        }
                    ],
                    "forReimbursment": true,
                    "forRequisition": true,
                    "statusObj": {
                        "id": "617663fed4572eb6d275b474",
                        "statusName": "Active",
                        "forUsers": true,
                        "forPayment": false,
                        "forRequisition": false
                    },
                    "createdBy": null,
                    "createdDate": null
                },
                {
                    "id": "61e296afd22ce050b6147d79",
                    "transferTypeName": "Cheque",
                    "fieldsRequired": true,
                    "fields": [
                        {
                            "fieldName": "Name Of the Payee",
                            "fieldValue": null,
                            "isFieldMandatory": true
                        },
                        {
                            "fieldName": "Remarks",
                            "fieldValue": null,
                            "isFieldMandatory": true
                        }
                    ],
                    "forReimbursment": false,
                    "forRequisition": true,
                    "statusObj": {
                        "id": "617663fed4572eb6d275b474",
                        "statusName": "Active",
                        "forUsers": true,
                        "forPayment": false,
                        "forRequisition": false
                    },
                    "createdBy": null,
                    "createdDate": null
                }
            ],
            "fields": [
                {
                    "fieldName": "Beneficiary Name",
                    "fieldValue": "HCN",
                    "isFieldMandatory": true
                },
                {
                    "fieldName": "IBAN or A/C Number",
                    "fieldValue": "1234567890",
                    "isFieldMandatory": true
                },
                {
                    "fieldName": "Beneficiary Address",
                    "fieldValue": "10-3-282/2/2, 2 nd floor, above Zee cabs",
                    "isFieldMandatory": true
                },
                {
                    "fieldName": "Bank Name",
                    "fieldValue": "Ahli United Bank",
                    "isFieldMandatory": true
                },
                {
                    "fieldName": "Bank Address",
                    "fieldValue": "Mehdipatnam",
                    "isFieldMandatory": true
                },
                {
                    "fieldName": "Swift Code",
                    "fieldValue": "ABCD9848",
                    "isFieldMandatory": true
                },
                {
                    "fieldName": "Clearing Code",
                    "fieldValue": "ABCD1477",
                    "isFieldMandatory": false
                },
                {
                    "fieldName": "Name Of the Payee",
                    "fieldValue": "HCN",
                    "isFieldMandatory": true
                },
                {
                    "fieldName": "Remarks",
                    "fieldValue": "Nothing",
                    "isFieldMandatory": true
                }
            ],
            "statusObj": {
                "id": "617663fed4572eb6d275b474",
                "statusName": "Active",
                "forUsers": true,
                "forPayment": false,
                "forRequisition": false
            },
            "createdBy": null,
            "createdDate": null
        }
    ],
    "fromDate": null,
    "toDate": null
}

export const currencies = {
    "AED": "United Arab Emirates Dirham",
    "AFN": "Afghan Afghani",
    "ALL": "Albanian Lek",
    "AMD": "Armenian Dram",
    "ANG": "Netherlands Antillean Guilder",
    "AOA": "Angolan Kwanza",
    "ARS": "Argentine Peso",
    "AUD": "Australian Dollar",
    "AWG": "Aruban Florin",
    "AZN": "Azerbaijani Manat",
    "BAM": "Bosnia-Herzegovina Convertible Mark",
    "BBD": "Barbadian Dollar",
    "BDT": "Bangladeshi Taka",
    "BGN": "Bulgarian Lev",
    "BHD": "Bahraini Dinar",
    "BIF": "Burundian Franc",
    "BMD": "Bermudan Dollar",
    "BND": "Brunei Dollar",
    "BOB": "Bolivian Boliviano",
    "BRL": "Brazilian Real",
    "BSD": "Bahamian Dollar",
    "BTC": "Bitcoin",
    "BTN": "Bhutanese Ngultrum",
    "BTS": "BitShares",
    "BWP": "Botswanan Pula",
    "BYN": "Belarusian Ruble",
    "BZD": "Belize Dollar",
    "CAD": "Canadian Dollar",
    "CDF": "Congolese Franc",
    "CHF": "Swiss Franc",
    "CLF": "Chilean Unit of Account (UF)",
    "CLP": "Chilean Peso",
    "CNH": "Chinese Yuan (Offshore)",
    "CNY": "Chinese Yuan",
    "COP": "Colombian Peso",
    "CRC": "Costa Rican Colón",
    "CUC": "Cuban Convertible Peso",
    "CUP": "Cuban Peso",
    "CVE": "Cape Verdean Escudo",
    "CZK": "Czech Republic Koruna",
    "DASH": "Dash",
    "DJF": "Djiboutian Franc",
    "DKK": "Danish Krone",
    "DOGE": "DogeCoin",
    "DOP": "Dominican Peso",
    "DZD": "Algerian Dinar",
    "EAC": "EarthCoin",
    "EGP": "Egyptian Pound",
    "EMC": "Emercoin",
    "ERN": "Eritrean Nakfa",
    "ETB": "Ethiopian Birr",
    "ETH": "Ethereum",
    "EUR": "Euro",
    "FCT": "Factom",
    "FJD": "Fijian Dollar",
    "FKP": "Falkland Islands Pound",
    "FTC": "Feathercoin",
    "GBP": "British Pound Sterling",
    "GEL": "Georgian Lari",
    "GGP": "Guernsey Pound",
    "GHS": "Ghanaian Cedi",
    "GIP": "Gibraltar Pound",
    "GMD": "Gambian Dalasi",
    "GNF": "Guinean Franc",
    "GTQ": "Guatemalan Quetzal",
    "GYD": "Guyanaese Dollar",
    "HKD": "Hong Kong Dollar",
    "HNL": "Honduran Lempira",
    "HRK": "Croatian Kuna",
    "HTG": "Haitian Gourde",
    "HUF": "Hungarian Forint",
    "IDR": "Indonesian Rupiah",
    "ILS": "Israeli New Sheqel",
    "IMP": "Manx pound",
    "INR": "Indian Rupee",
    "IQD": "Iraqi Dinar",
    "IRR": "Iranian Rial",
    "ISK": "Icelandic Króna",
    "JEP": "Jersey Pound",
    "JMD": "Jamaican Dollar",
    "JOD": "Jordanian Dinar",
    "JPY": "Japanese Yen",
    "KES": "Kenyan Shilling",
    "KGS": "Kyrgystani Som",
    "KHR": "Cambodian Riel",
    "KMF": "Comorian Franc",
    "KPW": "North Korean Won",
    "KRW": "South Korean Won",
    "KWD": "Kuwaiti Dinar",
    "KYD": "Cayman Islands Dollar",
    "KZT": "Kazakhstani Tenge",
    "LAK": "Laotian Kip",
    "LBP": "Lebanese Pound",
    "LD": "Linden Dollar",
    "LKR": "Sri Lankan Rupee",
    "LRD": "Liberian Dollar",
    "LSL": "Lesotho Loti",
    "LTC": "LiteCoin",
    "LYD": "Libyan Dinar",
    "MAD": "Moroccan Dirham",
    "MDL": "Moldovan Leu",
    "MGA": "Malagasy Ariary",
    "MKD": "Macedonian Denar",
    "MMK": "Myanma Kyat",
    "MNT": "Mongolian Tugrik",
    "MOP": "Macanese Pataca",
    "MRU": "Mauritanian Ouguiya",
    "MUR": "Mauritian Rupee",
    "MVR": "Maldivian Rufiyaa",
    "MWK": "Malawian Kwacha",
    "MXN": "Mexican Peso",
    "MYR": "Malaysian Ringgit",
    "MZN": "Mozambican Metical",
    "NAD": "Namibian Dollar",
    "NGN": "Nigerian Naira",
    "NIO": "Nicaraguan Córdoba",
    "NMC": "Namecoin",
    "NOK": "Norwegian Krone",
    "NPR": "Nepalese Rupee",
    "NVC": "NovaCoin",
    "NXT": "Nxt",
    "NZD": "New Zealand Dollar",
    "OMR": "Omani Rial",
    "PAB": "Panamanian Balboa",
    "PEN": "Peruvian Nuevo Sol",
    "PGK": "Papua New Guinean Kina",
    "PHP": "Philippine Peso",
    "PKR": "Pakistani Rupee",
    "PLN": "Polish Zloty",
    "PPC": "Peercoin",
    "PYG": "Paraguayan Guarani",
    "QAR": "Qatari Rial",
    "RON": "Romanian Leu",
    "RSD": "Serbian Dinar",
    "RUB": "Russian Ruble",
    "RWF": "Rwandan Franc",
    "SAR": "Saudi Riyal",
    "SBD": "Solomon Islands Dollar",
    "SCR": "Seychellois Rupee",
    "SDG": "Sudanese Pound",
    "SEK": "Swedish Krona",
    "SGD": "Singapore Dollar",
    "SHP": "Saint Helena Pound",
    "SLL": "Sierra Leonean Leone",
    "SOS": "Somali Shilling",
    "SRD": "Surinamese Dollar",
    "SSP": "South Sudanese Pound",
    "STD": "São Tomé and Príncipe Dobra (pre-2018)",
    "STN": "São Tomé and Príncipe Dobra",
    "STR": "Stellar",
    "SVC": "Salvadoran Colón",
    "SYP": "Syrian Pound",
    "SZL": "Swazi Lilangeni",
    "THB": "Thai Baht",
    "TJS": "Tajikistani Somoni",
    "TMT": "Turkmenistani Manat",
    "TND": "Tunisian Dinar",
    "TOP": "Tongan Pa'anga",
    "TRY": "Turkish Lira",
    "TTD": "Trinidad and Tobago Dollar",
    "TWD": "New Taiwan Dollar",
    "TZS": "Tanzanian Shilling",
    "UAH": "Ukrainian Hryvnia",
    "UGX": "Ugandan Shilling",
    "USD": "United States Dollar",
    "UYU": "Uruguayan Peso",
    "UZS": "Uzbekistan Som",
    "VEF": "Venezuelan Bolívar Fuerte (Old)",
    "VEF_BLKMKT": "Venezuelan Bolívar (Black Market)",
    "VEF_DICOM": "Venezuelan Bolívar (DICOM)",
    "VEF_DIPRO": "Venezuelan Bolívar (DIPRO)",
    "VES": "Venezuelan Bolívar Soberano",
    "VND": "Vietnamese Dong",
    "VTC": "VertCoin",
    "VUV": "Vanuatu Vatu",
    "WST": "Samoan Tala",
    "XAF": "CFA Franc BEAC",
    "XAG": "Silver Ounce",
    "XAU": "Gold Ounce",
    "XCD": "East Caribbean Dollar",
    "XDR": "Special Drawing Rights",
    "XMR": "Monero",
    "XOF": "CFA Franc BCEAO",
    "XPD": "Palladium Ounce",
    "XPF": "CFP Franc",
    "XPM": "Primecoin",
    "XPT": "Platinum Ounce",
    "XRP": "Ripple",
    "YER": "Yemeni Rial",
    "ZAR": "South African Rand",
    "ZMW": "Zambian Kwacha",
    "ZWL": "Zimbabwean Dollar"
}