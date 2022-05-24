// Crockford's supplant method (poor man's templating)
var signalR = "@microsoft/signalr";

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
var token = "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJlbWFpbCI6Inl1bnVzb3pkZW1pcjQ2OEBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieXVudXMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9tb2JpbGVwaG9uZSI6IjUzOTMxODY4NjQiLCJJcEFkZHJlc3MiOiI6OjEiLCJJc0RlbGV0ZWQiOiJGYWxzZSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlVzZXIiLCJuYmYiOjE2NTMzNzUwMDcsImV4cCI6MTY1MzM5NDgwNywiaXNzIjoiWXVudXNAeXVudXMuY29tIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6MzAwMCJ9.f-GG3Lk5srOQUuLs706nNu3NZ3G6lQqNtKF5LRJLC4w";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7250/portfolio?access_token=" + token, {
        //.withUrl("http://fahax.xyz/chat", {
        //skipNegotiation: false,
        //transport: 'ServerSentEvents',

        //transport: signalR.HttpTransportType.WebSockets,

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

//async function start() {
//    try {
//        connection.start().then(function () {
//            console.log("SignalR Connected.");
//        });
//    } catch (err) {
//        console.log(err);
//        setTimeout(start, 5000);
//    }
//};
//start();



function startStreaming() {
    console.log("Stream Çalıştı.");
    connection.stream("DataStream", 500)
        .subscribe({
            next: (item) => {
                console.log("Stream Bağlandı.");
                //item.forEach((coin) => {

                //    displayStock(coin);
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

//function marketOpened() {
//    tickerInterval = setInterval(moveTicker, 20);
//    document.getElementById('open').setAttribute("disabled", "disabled");
//    document.getElementById('close').removeAttribute("disabled");
//    document.getElementById('reset').setAttribute("disabled", "disabled");
//}

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