using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TRL.Common;
//using TRL.Common.Extensions;
using TRL.Common.TimeHelpers;
using TRL.Common.Collections;
using TRL.Common.Data;
using TRL.Common.Extensions.Data;
using TRL.Common.Handlers;
using TRL.Common.Models;
using TRL.Logging;

namespace TRL.Handlers.Cancel
{
    public class MakeOrderCancellationRequestOnQuote : QuotesHandler
    {
        private StrategyHeader strategyHeader;
        private double priceShift;
        private IQuoteProvider quotesProvider;
        private IDataContext tradingData;
        private ILogger logger;

        private double bestPrice;
        private OrderCancellationRequest request;

        public MakeOrderCancellationRequestOnQuote(StrategyHeader strategyHeader,
            double priceShiftPoints)
            : this(strategyHeader, priceShiftPoints, OrderBook.Instance, TradingData.Instance, new NullLogger()) { }

        public MakeOrderCancellationRequestOnQuote(StrategyHeader strategyHeader,
            double priceShiftPoints,
            IQuoteProvider quotesProvider,
            IDataContext tradingData,
            ILogger logger)
            : base(quotesProvider)
        {
            this.strategyHeader = strategyHeader;
            this.priceShift = priceShiftPoints;
            this.quotesProvider = quotesProvider;
  