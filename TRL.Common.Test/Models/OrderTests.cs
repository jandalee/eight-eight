using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Models;
using TRL.Common.TimeHelpers;
using TRL.Configuration;
using System.Globalization;
using TRL.Common.Data;

namespace TRL.Common.Test.Models
{
    [TestClass]
    public class OrderTests
    {
        private StrategyHeader strategyHeader;
        private Signal signal;

        [TestInitialize]
        public void Setup()
        {
            this.strategyHeader = new StrategyHeader(1, "Strategy", "BP12345-RF-01", "RTS-6.13_FT", 10);
            this.signal = new Signal(this.strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Limit, 150000, 0, 150100);
        }

        [TestMethod]
        public void Buy_Order_UnfilledSignedAmount_test()
        {
            Order order = new Order { Id = 1, Portfolio = this.signal.Strategy.Portfolio, Symbol = this.signal.Strategy.Symbol, TradeAction = this.signal.TradeAction, Amount = this.signal.Strategy.Amount, FilledAmount = 3, Signal = this.signal };

            Assert.AreEqual(7, order.UnfilledSignedAmount);
        }

        [TestMethod]
        public void Sell_Order_UnfilledSignedAmount_test()
        {
            Signal signal = new Signal(this.strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Sell, OrderType.Limit, 150000, 0, 149900);
            Order order = new Order { Id = 1, Portfolio = signal.Strategy.Portfolio, Symbol = signal.Strategy.Symbol, TradeAction = signal.TradeAction, Amount = signal.Strategy.Amount, FilledAmount = 3, Signal = signal };

            Assert.AreEqual(-7, order.UnfilledSignedAmount);
        }

        [TestMethod]
        public void ByDefault_Order_Expires_At_Midnight()
        {
            Signal signal = new Signal(this.strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 149000, 0, 0);

            Order order = new Order(signal);

            Assert.AreEqual(this.strategyHeader.Portfolio, order.Portfolio);
            Assert.AreEqual(this.strategyHeader.Symbol, order.Symbol);
            Assert.AreEqual(signal.TradeAction, order.TradeAction);
            Assert.AreEqual(signal.OrderType, order.OrderType);
            Assert.AreEqual(0, order.Price);
            Assert.AreEqual(10, order.Amount);
            Assert.AreEqual(0, order.Stop);
            Assert.AreEqual(signal, order.Signal);
            Assert.AreEqual(signal.Id, order.SignalId);

            ITradingSchedule tradingSchedule = new FortsTradingSchedule();

            Assert.AreEqual(tradingSchedule.SessionEnd, order.ExpirationDate);
        }

        [TestMethod]
        public void ByDefault_Order_Is_Not_Expired()
        {
            Signal signal = new Signal(this.strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 149000, 0, 0);

            Order order = new Order(signal);

            Assert.IsFalse(order.IsExpired);
        }

        [TestMethod]
        public void Order_Is_Expired()
        {
            Signal signal = new Signal(this.strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 149000, 0, 0);

            Order order = new Order(signal);
            order.ExpirationDate = BrokerDateTime.Make(DateTime.Now).AddSeconds(-5);

            Assert.IsTrue(order.IsExpired);
        }

        [TestMethod]
        public void Order_Is_Not_Filled()
        {
            Signal signal = new Signal(this.strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 149000, 0, 0);

            Order order = new Order(signal);

            Assert.IsFalse(order.IsFilled);
        }

        [TestMethod]
        public void Order_IsFilled()
        {
            Signal signal = new Signal(this.strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 149000, 0, 0);

            Order order = new Order(signal);

            order.FilledAmount = 10;

            Assert.IsTrue(order.IsFilled);
        }

        [TestMethod]
        public void New_Order_IsNotFilledPartially()
        {
            Signal signal = new Signal(this.strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 149000, 0, 0);

            Order order = new Order(signal);

            Assert.IsFalse(order.IsFilledPartially);
        }

        [TestMethod