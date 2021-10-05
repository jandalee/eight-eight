
﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TRL.Common.Data;
using TRL.Common.Extensions.Data;
using TRL.Common.Models;
using TRL.Common.Collections;
using TRL.Common.Data.Spreads;
using TRL.Logging;
using TRL.Common;
using TRL.Common.TimeHelpers;
//using TRL.Common.Extensions;

namespace TRL.Handlers.Spreads
{
    public class SellSpreadOnQuoteChange
    {
        private IEnumerable<StrategyHeader> leftLeg, rightLeg;
        private OrderBookContext quotesProvider;
        private IDataContext tradingData;
        private ILogger logger;
        private ObservableQueue<Signal> signalQueue;
        private SpreadSettings spreadSettings;

        public SellSpreadOnQuoteChange(OrderBookContext quotesProvider,
            IEnumerable<StrategyHeader> leftLeg,
            IEnumerable<StrategyHeader> rightLeg,
            SpreadSettings spreadSettings,
            IDataContext dataContext,
            ObservableQueue<Signal> signalQueue,
            ILogger logger)
        {
            this.quotesProvider = quotesProvider;
            this.leftLeg = leftLeg;
            this.rightLeg = rightLeg;
            this.spreadSettings = spreadSettings;
            this.tradingData = dataContext;
            this.signalQueue = signalQueue;
            this.logger = logger;
            this.quotesProvider.OnQuotesUpdate += new SymbolDataUpdatedNotification(quotesProvider_OnQuotesUpdate);
        }

        public void quotesProvider_OnQuotesUpdate(string symbol)
        {
            if (!DoesSpreadIncludesSymbol(symbol))
                return;

            if (UnfilledOrdersExists())
                return;

            if (PositionExists())
                return;

            double spreadPrice = MakeSellSpread();

            if (spreadPrice == 0)
                return;

            if (spreadPrice >= this.spreadSettings.SellAfterPrice)
            {
                MakeSellSignals(spreadPrice);
                MakeBuySignals(spreadPrice);
            }
        }

        private bool DoesSpreadIncludesSymbol(string symbol)
        {
            return this.leftLeg.Any(i=>i.Symbol.Equals(symbol)) 
                || this.rightLeg.Any(i=>i.Symbol.Equals(symbol));

        }

        private bool PositionExists()
        {
            return PositionExists(this.leftLeg) || PositionExists(this.rightLeg);
        }

        private bool PositionExists(IEnumerable<StrategyHeader> strategies)
        {
            foreach (StrategyHeader s in strategies)
            {
                if (this.tradingData.GetAmount(s) != 0)
                    return true;
            }

            return false;
        }

        private double MakeSellSpread()
        {
            IGenericFactory<double> factory =
                new SellSpreadFactory(this.leftLeg, this.rightLeg, this.quotesProvider);

            return factory.Make();
        }

        private void MakeSellSignals(double sellSpreadPrice)
        {
            foreach (StrategyHeader s in this.leftLeg)
            {
                Signal signal = new Signal(s, BrokerDateTime.Make(DateTime.Now), TradeAction.Sell, OrderType.Market, sellSpreadPrice, 0, 0);

                this.logger.Log(String.Format("{0:dd/MM/yyyy H:mm:ss.fff}, {1}, сигнал {2} на отправку заявки на продажу спреда {3}.", DateTime.Now, this.GetType().Name, signal.ToString(), s.ToString()));

                this.signalQueue.Enqueue(signal);
            }
        }

        private void MakeBuySignals(double sellSpreadPrice)
        {
            foreach (StrategyHeader s in this.rightLeg)
            {
                Signal signal = new Signal(s, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, sellSpreadPrice, 0, 0);

                this.logger.Log(String.Format("{0:dd/MM/yyyy H:mm:ss.fff}, {1}, сигнал {2} на отправку заявки на продажу спреда {3}.", DateTime.Now, this.GetType().Name, signal.ToString(), s.ToString()));

                this.signalQueue.Enqueue(signal);
            }
        }

        private bool UnfilledOrdersExists()
        {
            return UnfilledOrdersExists(this.leftLeg) || UnfilledOrdersExists(this.rightLeg);
        }

        private bool UnfilledOrdersExists(IEnumerable<StrategyHeader> strategies)
        {
            int count = strategies.Count();

            StrategyHeader[] sArray = strategies.ToArray();

            for (int i = 0; i < count; i++)
            {
                if (this.tradingData.UnfilledExists(sArray[i], OrderType.Market))
                    return true;
            }

            return false;
        }
    }
}