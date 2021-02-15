using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Models;
using TRL.Common.Data;
using TRL.Common.TimeHelpers;
using TRL.Common.Collections;
using TRL.Configuration;
using TRL.Common.Handlers;
using TRL.Common.Test.Mocks;
using TRL.Emulation;
using TRL.Logging;

namespace TRL.Common.Handlers.Test
{
    [TestClass]
    public class SignalQueueProcessorTests
    {
        private IDataContext tradingData;
        private ObservableQueue<Signal> signalQueue;
        private ObservableQueue<Order> orderQueue;
        private ITradingSchedule schedule;
        private StrategyHeader str1, str2, str3;

        [TestInitialize]
        public void Setup()
        {
            this.tradingData = new TradingDataContext();
            this.signalQueue = new ObservableQueue<Signal>();
            this.orderQueue = new ObservableQueue<Order>();
            this.schedule = new AlwaysTimeToTradeSchedule();

            SignalQueueProcessor processor = new SignalQueueProcessor(this.signalQueue, this.orderQueue, this.tradingData, this.schedule, new NullLogger());

            AddStrategies();

        }

        public void AddStrategies()
        {
            this.str1 = new StrategyHeader(1, "First", "BP12345-RF-01", "RTS-6.13_FT", 5);
            this.str2 = new StrategyHeader(2, "Second", "BP12345-RF-01", "RTS-9.13_FT", 8);
            this.str3 = new StrategyHeader(3, "Third", "BP12345-RF-01", "RTS-9.13_FT", 8);

            this.tradingData.Get<ICollection<StrategyHeader>>().Add(this.str1);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(this.str2);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(this.str3);
        }


        [TestMethod]
        public void Handlers_drop_signal_when_identical_unfilled_limit_strategy_order_exists()
        {
            Signal s1 = new Signal(this.str2, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Limit, 130000, 0, 130000);
            this.tradingData.Get<ICollection<Signal>>().Add(s1);

            Order o1 = new Order(s1);
            this.tradingData.Get<ICollection<Order>>().Add(o1);

            Assert.AreEqual(0, this.signalQueue.Count);
            Assert.AreEqual(0, this.orderQueue.Count);

            Signal s2 = new Signal(this.str2, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Limit, 130000, 0, 130000);
            this.signalQueue.Enqueue(s2);

            Assert.AreEqual(0, this.signalQueue.Count);
            Assert.AreEqual(0, this.orderQueue.Count);
        }

        [TestMethod]
        public void Handlers_drop_signal_when_identical_unfilled_stop_strategy_order_exists()
        {
            Signal s1 = new Signal(this.str2, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Stop, 130000, 130000, 0);
            this.tradingData.Get<ICollection<Signal>>().Add(s1);

            Order o1 = new Order(s1);
            this.tradingData.Get<ICollection<Order>>().Add(o1);

            Assert.AreEqual(0, this.signalQueue.Count);
            Assert.AreEqual(0, this.orderQueue.Count);

            Signal s2 = new Signal(this.str2, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Stop, 130000, 130000, 0);
            this.signalQueue.Enqueue(s2);

            Assert.AreEqual(0, this.signalQueue.Count);
            Assert.AreEqual(0, this.orderQueue.Count);
        }

        [TestMethod]
        public void Handlers_drop_signal_when_identical_unfilled_market_strategy_order_exists()
        {

            Signal signal = new Signal(this.str3, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 130000, 0, 0);
            this.tradingData.Get<ICollection<Signal>>().Add(signal);

            Order order = new Order(signal);
            this.tradingData.Get<ICollection<Order>>().Add(order);

            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Signal>>().Count());
            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Order>>().Count());
            Assert.AreEqual(0, this.signalQueue.Count);

            Signal signal2 = new Signal(this.str3, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 130000, 0, 0);
            this.signalQueue.Enqueue(signal2);

            Assert.AreEqual(1, this.tradingData.Get<IEnumerable