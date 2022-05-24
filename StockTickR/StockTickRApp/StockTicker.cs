using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using StockTickR.Hubs;

namespace StockTickR
{
    public class StockTicker
    {
        private readonly SemaphoreSlim _marketStateLock = new SemaphoreSlim(1, 1);
        private readonly SemaphoreSlim _updateStockPricesLock = new SemaphoreSlim(1, 1);

        private readonly ConcurrentDictionary<string, Stock> _stocks = new ConcurrentDictionary<string, Stock>();

        private readonly Subject<Stock> _subject = new Subject<Stock>();

        // Stock can go up or down by a percentage of this factor on each change
        private readonly double _rangePercent = 0.002;

        private readonly TimeSpan _updateInterval = TimeSpan.FromMilliseconds(250);
        private readonly Random _updateOrNotRandom = new Random();
        int abc = 0;
        private Timer _timer;
        private volatile bool _updatingStockPrices;
        private volatile MarketState _marketState;

        public StockTicker(IHubContext<StockTickerHub> hub)
        {
            Hub = hub;
            LoadDefaultStocks();
        }

        private IHubContext<StockTickerHub> Hub
        {
            get;
            set;
        }

        public MarketState MarketState
        {
            get { return _marketState; }
            private set { _marketState = value; }
        }

        public IEnumerable<Stock> GetAllStocks()
        {
            return _stocks.Values;
        }

        public IObservable<Stock> StreamStocks()
        {
            return _subject;
        }

        public async Task OpenMarket()
        {
            await _marketStateLock.WaitAsync();
            try
            {
                if (MarketState != MarketState.Open)
                {
                    _timer = new Timer(UpdateStockPrices, null, _updateInterval, _updateInterval);

                    MarketState = MarketState.Open;

                    await BroadcastMarketStateChange(MarketState.Open);
                }
            }
            finally
            {
                _marketStateLock.Release();
            }
        }

        public async Task CloseMarket()
        {
            await _marketStateLock.WaitAsync();
            try
            {
                if (MarketState == MarketState.Open)
                {
                    if (_timer != null)
                    {
                        _timer.Dispose();
                    }

                    MarketState = MarketState.Closed;

                    await BroadcastMarketStateChange(MarketState.Closed);
                }
            }
            finally
            {
                _marketStateLock.Release();
            }
        }

        public async Task Reset()
        {
            await _marketStateLock.WaitAsync();
            try
            {
                if (MarketState != MarketState.Closed)
                {
                    throw new InvalidOperationException("Market must be closed before it can be reset.");
                }

                LoadDefaultStocks();
                await BroadcastMarketReset();
            }
            finally
            {
                _marketStateLock.Release();
            }
        }

        private void LoadDefaultStocks()
        {
            _stocks.Clear();

            var stocks = new List<Stock>
            {
                new Stock { Symbol = "MSFT", Price = 107.56m },
                new Stock { Symbol = "AAPL", Price = 215.49m },
                new Stock { Symbol = "GOOG", Price = 1221.15m },
                new Stock { Symbol = "ASDC", Price = 123.47m },
                new Stock { Symbol = "PROP", Price = 56.31m },
                new Stock { Symbol = "GFSA", Price = 12.22m },
                new Stock { Symbol = "AJSC", Price = 21.53m },
                 new Stock { Symbol = "MSAFT", Price = 107.56m },
                new Stock { Symbol = "AAAPL", Price = 215.49m },
                new Stock { Symbol = "GOAOG", Price = 1221.15m },
                new Stock { Symbol = "ASADC", Price = 123.47m },
                new Stock { Symbol = "PRHOP", Price = 56.31m },
                new Stock { Symbol = "GFGSA", Price = 12.22m },
                new Stock { Symbol = "AJDSC", Price = 21.53m },
                 new Stock { Symbol = "MSSFT", Price = 107.56m },
                new Stock { Symbol = "AASPL", Price = 215.49m },
                new Stock { Symbol = "GOOBG", Price = 1221.15m },
                new Stock { Symbol = "ASDVC", Price = 123.47m },
                new Stock { Symbol = "PRVXOP", Price = 56.31m },
                new Stock { Symbol = "GFBSA", Price = 12.22m },
                new Stock { Symbol = "AJSC", Price = 21.53m },
                 new Stock { Symbol = "MXCSFT", Price = 107.56m },
                new Stock { Symbol = "AAPL", Price = 215.49m },
                new Stock { Symbol = "XCSD", Price = 1221.15m },
                new Stock { Symbol = "CXXZ", Price = 123.47m },
                new Stock { Symbol = "CX", Price = 56.31m },
                new Stock { Symbol = "ASI", Price = 12.22m },
                new Stock { Symbol = "ASYTD", Price = 21.53m },
                 new Stock { Symbol = "MSDSFT", Price = 107.56m },
                new Stock { Symbol = "AANDPL", Price = 215.49m },
                new Stock { Symbol = "SDFC", Price = 1221.15m },
                new Stock { Symbol = "ASDX", Price = 123.47m },
                new Stock { Symbol = "ASDWQ", Price = 56.31m },
                new Stock { Symbol = "YEW", Price = 12.22m },
                new Stock { Symbol = "35W", Price = 21.53m }
            };

            stocks.ForEach(stock => _stocks.TryAdd(stock.Symbol, stock));
        }

        private async void UpdateStockPrices(object state)
        {
            // This function must be re-entrant as it's running as a timer interval handler
            await _updateStockPricesLock.WaitAsync();
            abc = abc + 1;

            try
            {
                if (!_updatingStockPrices)
                {
                    _updatingStockPrices = true;

                    foreach (var stock in _stocks.Values)
                    {
                        TryUpdateStockPrice(stock);

                        _subject.OnNext(stock);
                    }

                    _updatingStockPrices = false;
                }
            }
            finally
            {
                _updateStockPricesLock.Release();
            }
        }

        private bool TryUpdateStockPrice(Stock stock)
        {
            // Randomly choose whether to udpate this stock or not
            var r = _updateOrNotRandom.NextDouble();
            if (r > 0.2)
            {
                return false;
            }

            // Update the stock price by a random factor of the range percent
            var random = new Random((int)Math.Floor(stock.Price));
            var percentChange = random.NextDouble() * _rangePercent;
            var pos = random.NextDouble() > 0.51;
            var change = Math.Round(stock.Price * (decimal)percentChange, 2);
            change = pos ? change : -change;

            stock.Price += change;
            return true;
        }

        private async Task BroadcastMarketStateChange(MarketState marketState)
        {
            switch (marketState)
            {
                case MarketState.Open:
                    await Hub.Clients.All.SendAsync("marketOpened");
                    break;
                case MarketState.Closed:
                    await Hub.Clients.All.SendAsync("marketClosed");
                    break;
                default:
                    break;
            }
        }

        private async Task BroadcastMarketReset()
        {
            await Hub.Clients.All.SendAsync("marketReset");
        }
    }

    public enum MarketState
    {
        Closed,
        Open
    }
}