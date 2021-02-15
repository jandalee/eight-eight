using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Data;
using TRL.Common.Models;
using TRL.Emulation;

namespace TRL.Common.Extensions.Data.Test
{
    [TestClass]
    public class TradingDataExtensionsForEmulationTests
    {
        private StrategyHeader strategyHeader;
        private IDataContext tradingData;

        [TestInitialize]
        public void Setup()
        {
            this.strategyHeader = new StrategyHeader(1, "Description", "BP12345-RF-01", "RTS-3.14_FT", 1);

            this.tradingData = new TradingDataContext();

            this.tradingData.Get<ICollection<StrategyHeader>>().Add(this.strategyHeader);
        }

        [TestMethod]
        public void AddSignalAndItsOrder_test()
        {
            Assert.AreEqual(0, this.tradingData.Get<IEnumerable<Signal>>().Count());
            Assert.AreEqual(0, this.tradingData.Get<IEnumerable<Order>>().Count());

            Signal signal = new Signal(this.strategyHeader, DateTime.Now, TradeAction.Buy, OrderType.Market, 150000, 0, 0);

            Order order = this.tradingData.AddSignalAndItsOrder(signal);

            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Signal>>().Count());
            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Order>>().Count());

            Assert.AreEqual(signal.Id, order.SignalId);
            Assert.AreEqual(signal.Amount, order.Amount);
        }

        [TestMethod]
        