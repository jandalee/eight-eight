using System;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Models;
using System.Collections.Generic;
using TRL.Common.Collections;
using TRL.Common.Data;
using TRL.Common;
using TRL.Emulation;
using TRL.Logging;

namespace TRx.Trader.Scalper.Test
{
    [TestClass]
    public class FollowTrendOnTickTests:TraderBaseInitializer
    {

        private StrategyHeader strategyHeader;
        private OrderBookContext orderBook;

        [TestInitialize]
        public void Setup()
        {
            this.strategyHeader = this.tradingData.Get<IEnumerable<StrategyHeader>>().Single(s => s.Id == 1);
            this.orderBook = new OrderBookContext();
            this.tradingData.Get<ObservableCollection<Tick>>().Add(new Tick("RTS-12.13_FT", new DateTime(2013, 12, 3, 10, 0, 0), 138000, 3600));

            this.orderBook.Update(0, this.strategyHeader.Symbol, 138000, 100,