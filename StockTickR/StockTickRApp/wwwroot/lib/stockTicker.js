// Crockford's supplant method (poor man's templating)

if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}

//Id = _symbols.FindIndex(a => a.Contains(coin.Symbol)),
//    Symbol = coin.Symbol,
//    PriceChange = coin.PriceChange,
//    PriceChangePercent = coin.PriceChangePercent,
//    Volume = coin.Volume,
//    OpenPrice = coin.OpenPrice,
//    HighPrice = coin.HighPrice,
//    LowPrice = coin.LowPrice,
//    ClosePrice = coin.PrevDayClosePrice,


var stockTable = document.getElementById('stockTable');
var stockTableBody = stockTable.getElementsByTagName('tbody')[0];
var rowTemplate = '<td>{symbol}</td><td>{lastPrice}</td><td>{openPrice}</td><td>{highPrice}</td><td>{lowPrice}</td><td class="changeValue"><span class="dir {directionClass}"></span> {priceChange}</td><td>{priceChangePercent}</td>';
//var tickerTemplate = '<span class="symbol">{symbol}</span> <span class="price">{closePrice}</span> <span class="changeValue"><span class="dir {directionClass}"></span> {priceChange} ({priceChangePercent})</span>';
var stockTicker = document.getElementById('stockTicker');
var stockTickerBody = stockTicker.getElementsByTagName('ul')[0];
var up = '▲';
var down = '▼';

var token = "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIiLCJlbWFpbCI6Inl1bnVzb3pkZW1pcjQ2OEBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoic3RyaW5nIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbW9iaWxlcGhvbmUiOiI1MzkzMTg2ODY0IiwiSXBBZGRyZXNzIjoiOjoxIiwiSXNEZWxldGVkIjoiRmFsc2UiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJVc2VyIiwibmJmIjoxNjUzNzU1MDE3LCJleHAiOjE2NTM3NzQ4MTcsImlzcyI6Ill1bnVzQHl1bnVzLmNvbSIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0OjMwMDAifQ.CetqsKaEblNm8QpcrVn6wc-qX8EDcyY6K_pGpnsYZHs";

const connection = new signalR.HubConnectionBuilder()

    //.withUrl("https://localhost:7250/portfolio?access_token=" + token, {

    //.withUrl("https://fhx.idealdata.com.tr/binance", {
    //.withUrl("https://fahax.xyz/portfolio?access_token=" + token, {

    .withUrl("https://localhost:7250/binance", {

        //  skipNegotiation: true,
        //transport: 'ServerSentEvents',

        transport: signalR.HttpTransportType.WebSockets,

        //   accessTokenFactory: () =>

    })
    .build();

async function start() {
    try {
        connection.start().then(function () {
            console.log("SignalR Connected.");
            startStreaming();

        });
    } catch (err) {
        console.log(err);
    }
};

connection.onclose(async () => {
    console.log("Kapandı");
    //await start();
});

// Start the connection.
start();


function startStreaming() {
    console.log("Stream Çalıştı.");

    connection.stream("GetTwoChart", "ETHBTC", "BTCUSDT")
        .subscribe({
            next: (item) => {
                console.log(item)
                //item.forEach((item) => {

                displayStock(item);
                //});

            },
            complete: () => {
                console.log(item);
            },
            error: (err) => {
                console.log("Hata var: " + err);
            },
        });

}


document.getElementById("open2").onclick = function () { moveTicker2() };

//var button = document.getElementById("open2").click();


function moveTicker2() {

    console.log("in onclick");
    connection.stream("GetDetailAsync", "BNBUSDT")
        .subscribe({
            next: (item) => {
                console.log(item)
                //item.forEach((item) => {

                displayStock(item);
                //});

            },
            complete: () => {
                console.log(item);
            },
            error: (err) => {
                console.log("Hata var: " + err);
            },
        });

}

var pos = 30;
var tickerInterval;
stockTickerBody.style.marginLeft = '30px';

function moveTicker() {
    pos--;
    if (pos < -600) {
        pos = 500;
    }

    stockTickerBody.style.marginLeft = pos + 'px';
}

function marketOpened() {
    tickerInterval = setInterval(moveTicker, 20);
    document.getElementById('open').setAttribute("disabled", "disabled");
    document.getElementById('close').removeAttribute("disabled");
    document.getElementById('reset').setAttribute("disabled", "disabled");
}

//function marketClosed() {
//    if (tickerInterval) {
//        clearInterval(tickerInterval);
//    }
//    document.getElementById('open').removeAttribute("disabled");
//    document.getElementById('close').setAttribute("disabled", "disabled");
//    document.getElementById('reset').removeAttribute("disabled");
//}


function displayStock(stock) {
    addOrReplaceStock(stockTableBody, stock, 'tr', rowTemplate);
    //  addOrReplaceStock(stockTickerBody, stock, 'li', tickerTemplate);

}

function addOrReplaceStock(table, stock, type, template) {
    var child = createStockNode(stock, type, template);

    // try to replace

    var stockNode = document.querySelector(type + "[data-symbol=" + stock.symbol + "]");
    if (stockNode) {
        var change = stockNode.querySelector(".changeValue");
        var prevChange = parseFloat(change.childNodes[1].data);
        if (prevChange > stock.priceChange) {
            child.className = "decrease";
        }
        else if (prevChange < stock.priceChange) {
            child.className = "increase";
        }
        else {
            return;
        }
        table.replaceChild(child, stockNode);
    } else {
        // add new stock
        table.appendChild(child);
    }
}

function createStockNode(stock, type, template) {
    var child = document.createElement(type);
    child.setAttribute('data-symbol', stock.symbol);
    child.setAttribute('class', stock.symbol);
    child.innerHTML = template.supplant(stock);
    return child;
}