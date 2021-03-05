using System;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Data;
using TRL.Common.Collections;
using TRL.Common.Models;
using System.Collections.Generic;
using TRL.Emulation;
using TRL.Handlers.StopLoss;
using TRL.Common.Extensions.Data;
using TRL.Logging;

namespace TRL.Common.Handlers.Test.StopLoss
{
    [TestClass]
    public class PlaceStrategyStopLossByPointsOnTradeMeasureFromTradePriceTests
    {
        private IDataContext tradingData;
        private ObservableQueue<Signal> signalQueue;
        private StrategyHeader strategyHeader;
        private StopPointsSettings spSettings;
        private StopLossOrderSettings slSettings;

        private PlaceStrategyStopLossByPointsOnTrade handler;

        [TestInitialize]
        public void Setup()
        {
            this.tradingData = new TradingDataContext();
            this.signalQueue = new ObservableQueue<Signal>();

            this.strategyHeader = new StrategyHeader(1, "Description", "ST12345-RF-01", "RTS-9.14", 10);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(this.strategyHeader);

            this.spSettings = new StopPointsSettings(this.strategyHeader, 100, false);
            this.tradingData.Get<ICollection<StopPointsSettings>>().Add(this.spSettings);

            this.slSettings = new StopLossOrderSettings(this.strategyHeader, 180);
            this.tradingData.Get<ICollection<StopLossOrderSettings>>().Add(this.slSettings);

            this.handler =
                new PlaceStrategyStopLossByPointsOnTrade(this.strategyHeader, this.tradingData, this.signalQueue, new NullLogger());

            Assert.AreEqual(0, this.tradingData.Get<IEnumerable<Order>>().Count());
            Assert.AreEqual(0, this.tradingData.Get<IEnumerable<Trade>>().Count());
            Assert.AreEqual(0, this.signalQueue.Count);
        }

        [TestMethod]
        public void PlaceStrategyStopLossByPointsOnTrade_is_Identified_test()
        {
            Assert.IsInstanceOfType(this.handler, typeof(IIdentified));
            Assert.AreEqual(this.strategyHeader.Id, this.handler.Id);
        }

        private Trade MakeTrade()
        {
            Trade trade = new Trade();
            trade.Id = 1;
            trade.Portfolio = "ST12345-RF-01";
            trade.Symbol = "RTS-9.14";
            trade.Amount = 9;
            trade.Price = 120000;
            return trade;
        }

        [TestMethod]
        public void do_nothing_when_here_is_no_signal_and_order_for_trade_test()
        {
            Trade trade = MakeTrade();

            this.tradingData.Get<ObservableHashSet<Trade>>().Add(trade);
            Assert.AreEqual(0, this.signalQueue.Count);
        }

        [TestMethod]
        public void make_signal_to_sell_on_stop_for_long_position_with_single_open_trade_test()
        {
            Signal openSignal = new Signal(this.strategyHeader, DateTime.Now, TradeAction.Buy, OrderType.Market, 125000, 0, 0);
            Trade trade = this.tradingData.AddSignalAndItsOrderAndTrade(openSignal);

            Assert.AreEqual(1, this.signalQueue.Count);

            Signal closeSignal = this.signalQueue.Dequeue();
            Assert.AreEqual(this.strategyHeader.Id, closeSignal.StrategyId);
            Assert.AreEqual(this.strategyHeader, closeSignal.Strategy);
            Assert.AreEqual(TradeAction.Sell, closeSignal.TradeAction);
            Assert.AreEqual(OrderType.Stop, closeSignal.OrderType);
            Assert.AreEqual(trade.Price, closeSignal.Price);
            Assert.AreEqual(trade.Price - this.spSettings.Points, closeSignal.Stop);
            Assert.AreEqual(trade.Amount, closeSignal.Amount);
        }

        [TestMethod]
        public void make_signal_to_sell_on_stop_for_long_position_with_multiple_open_trades_test()
        {
            Signal openSignal = new Signal(this.strategyHeader, DateTime.Now, TradeAction.Buy, OrderType.Market, 125000, 0, 0);
            Trade firstTrade = this.tradingData.AddSignalAndItsOrderAndTrade(openSignal, openSignal.Price, 5);
            Assert.AreEqual(0, this.signalQueue.Count);
            
            Trade secondTrade = this.tradingData.AddSignalAndItsOrderAndTrade(openSignal, openSignal.Price, 5);
            Assert.AreEqual(1, this.signalQueue.Count);

            Signal closeSignal = this.signalQueue.Dequeue();
            Assert.AreEqual(this.strategyHeader.Id, closeSignal.StrategyId);
            Assert.AreEqual(this.strategyHeader, closeSignal.Strategy);
            Ass