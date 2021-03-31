
﻿using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Data;
using TRL.Common.Models;
using TRL.Common.TimeHelpers;
using TRL.Common.Extensions.Data;
using TRL.Common.Handlers;
using TRL.Common.Collections;
using TRL.Logging;

namespace TRL.Common.Handlers.Test
{
    [TestClass]
    public class UpdatePositionOnTradeTests
    {
        private IDataContext tradingData;
        private StrategyHeader st1, st2, st3;
        private Signal s1, s2, s3;

        [TestInitialize]
        public void Handlers_Setup()
        {
            this.tradingData = new TradingDataContext();
            UpdatePositionOnTrade handler = new UpdatePositionOnTrade(this.tradingData, new NullLogger());
        }

        private void AddSignals()
        {
            this.s1 = new Signal(this.st1, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 130000, 0, 0);
            this.s2 = new Signal(this.st2, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 31000, 0, 0);
            this.s3 = new Signal(this.st3, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Limit, 131000, 0, 131100);
            this.tradingData.Get<ICollection<Signal>>().Add(this.s1);
            this.tradingData.Get<ICollection<Signal>>().Add(this.s2);
            this.tradingData.Get<ICollection<Signal>>().Add(this.s3);
        }

        private void AddStrategies()
        {
            this.st1 = new StrategyHeader(1, "Strategy 1", "BP12345-RF-01", "RTS-9.13_FT", 10);
            this.st2 = new StrategyHeader(2, "Strategy 2", "BP12345-RF-01", "Si-9.13_FT", 10);
            this.st3 = new StrategyHeader(3, "Strategy 3", "BP12345-RF-01", "RTS-9.13_FT", 10);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(st1);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(st2);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(st3);
        }

        [TestMethod]
        public void Handlers_UpdatePositionOnTrade_first_trade_for_position()
        {
            AddStrategies();

            AddSignals();

            Order o = new Order(this.s3);
            this.tradingData.Get<ICollection<Order>>().Add(o);
            Trade t = new Trade(o, this.s3.Strategy.Portfolio, this.s3.Strategy.Symbol, 124500, 3, BrokerDateTime.Make(DateTime.Now));

            Assert.AreEqual(0, this.tradingData.GetAmount(this.st3));
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(t);

            Assert.AreEqual(3, this.tradingData.GetAmount(this.st3));
        }

        [TestMethod]
        public void Handlers_UpdatePositionOnTrade_increase_long_position()
        {
            AddStrategies();

            AddSignals();

            this.tradingData.Get<ICollection<Position>>().Add(new Position(this.s1.Strategy.Portfolio, this.s1.Strategy.Symbol, 5));

            Order o = new Order(this.s3);
            this.tradingData.Get<ICollection<Order>>().Add(o);
            Trade t = new Trade(o, this.s3.Strategy.Portfolio, this.s3.Strategy.Symbol, 124500, 3, BrokerDateTime.Make(DateTime.Now));

            Assert.AreEqual(5, this.tradingData.Get<IEnumerable<Position>>().SingleOrDefault(p => p.Portfolio == this.st3.Portfolio && p.Symbol == this.st3.Symbol).Amount);
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(t);

            Assert.AreEqual(8, this.tradingData.Get<IEnumerable<Position>>().SingleOrDefault(p => p.Portfolio == this.st3.Portfolio && p.Symbol == this.st3.Symbol).Amount);
        }

        [TestMethod]
        public void Handlers_UpdatePositionOnTrade_decrease_long_position()
        {
            AddStrategies();

            AddSignals();

            this.tradingData.Get<ICollection<Position>>().Add(new Position(this.s1.Strategy.Portfolio, this.s1.Strategy.Symbol, 8));

            Signal signal = new Signal(this.st1, BrokerDateTime.Make(DateTime.Now), TradeAction.Sell, OrderType.Market, 0, 0, 0);

            Order o = new Order(signal);
            this.tradingData.Get<ICollection<Order>>().Add(o);
            Trade t = new Trade(o, signal.Strategy.Portfolio, signal.Strategy.Symbol, 124500, -3, BrokerDateTime.Make(DateTime.Now));

            Assert.AreEqual(8, this.tradingData.Get<IEnumerable<Position>>().SingleOrDefault(p => p.Portfolio == this.st3.Portfolio && p.Symbol == this.st3.Symbol).Amount);
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(t);

            Assert.AreEqual(5, this.tradingData.Get<IEnumerable<Position>>().SingleOrDefault(p => p.Portfolio == this.st3.Portfolio && p.Symbol == this.st3.Symbol).Amount);
        }

        [TestMethod]
        public void Handlers_UpdatePositionOnTrade_increase_short_position()
        {
            AddStrategies();

            AddSignals();

            this.tradingData.Get<ICollection<Position>>().Add(new Position(this.s1.Strategy.Portfolio, this.s1.Strategy.Symbol, -10));

            Signal signal = new Signal(this.st1, BrokerDateTime.Make(DateTime.Now), TradeAction.Sell, OrderType.Market, 0, 0, 0);

            Order o = new Order(signal);
            this.tradingData.Get<ICollection<Order>>().Add(o);
            Trade t = new Trade(o, signal.Strategy.Portfolio, signal.Strategy.Symbol, 124500, -2, BrokerDateTime.Make(DateTime.Now));

            Assert.AreEqual(-10, this.tradingData.Get<IEnumerable<Position>>().SingleOrDefault(p=>p.Portfolio == this.s1.Strategy.Portfolio && p.Symbol == this.s1.Strategy.Symbol).Amount);
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(t);

            Assert.AreEqual(-12, this.tradingData.Get<IEnumerable<Position>>().SingleOrDefault(p => p.Portfolio == this.s1.Strategy.Portfolio && p.Symbol == this.s1.Strategy.Symbol).Amount);
        }

        [TestMethod]
        public void Handlers_UpdatePositionOnTrade_decrease_short_position()
        {
            AddStrategies();

            AddSignals();

            this.tradingData.Get<ICollection<Position>>().Add(new Position(this.s1.Strategy.Portfolio, this.s1.Strategy.Symbol, -11));

            Order o = new Order(this.s3);
            this.tradingData.Get<ICollection<Order>>().Add(o);
            Trade t = new Trade(o, this.s3.Strategy.Portfolio, this.s3.Strategy.Symbol, 124500, 5, BrokerDateTime.Make(DateTime.Now));

            Assert.AreEqual(-11, this.tradingData.Get<IEnumerable<Position>>().SingleOrDefault(p => p.Portfolio == this.s1.Strategy.Portfolio && p.Symbol == this.s1.Strategy.Symbol).Amount);
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(t);

            Assert.AreEqual(-6, this.tradingData.Get<IEnumerable<Position>>().SingleOrDefault(p => p.Portfolio == this.s1.Strategy.Portfolio && p.Symbol == this.s1.Strategy.Symbol).Amount);
        }

        [TestMethod]
        public void Handlers_UpdatePositionOnTrade_ignore_same_trade()
        {
            StrategyHeader strategyHeader = new StrategyHeader(1, "Strategy", "BP12345-RF-01", "RTS-9.13_FT", 8);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(strategyHeader);

            Signal signal = new Signal(strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 131000, 0, 0);
            this.tradingData.Get<ICollection<Signal>>().Add(signal);

            Order order = new Order(signal);
            this.tradingData.Get<ICollection<Order>>().Add(order);

            Assert.AreEqual(0, this.tradingData.GetAmount(strategyHeader));

            Trade trade = new Trade(order, order.Portfolio, order.Symbol, 131010, order.Amount, BrokerDateTime.Make(DateTime.Now));
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(trade);

            Position position = this.tradingData.Get<IEnumerable<Position>>().Last();

            Assert.AreEqual(8, this.tradingData.Get<IEnumerable<Position>>().SingleOrDefault(p => p.Portfolio == strategyHeader.Portfolio && p.Symbol == strategyHeader.Symbol).Amount);
            Assert.AreEqual(8, position.Amount);

            this.tradingData.Get<ObservableHashSet<Trade>>().Add(trade);

            Assert.AreEqual(8, this.tradingData.GetAmount(strategyHeader));
            Assert.AreEqual(8, position.Amount);

        }

        [TestMethod]
        public void Handlers_UpdatePositionOnTrade_ignore_single_duplicate_trade()
        {

            StrategyHeader strategyHeader = new StrategyHeader(1, "Strategy", "BP12345-RF-01", "RTS-9.13_FT", 8);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(strategyHeader);

            Signal signal = new Signal(strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 131000, 0, 0);
            this.tradingData.Get<ICollection<Signal>>().Add(signal);

            Order order = new Order(signal);
            this.tradingData.Get<ICollection<Order>>().Add(order);

            Assert.AreEqual(0, this.tradingData.GetAmount(strategyHeader));

            Trade trade = new Trade(order, order.Portfolio, order.Symbol, 131010, order.Amount, BrokerDateTime.Make(DateTime.Now));
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(trade);

            Assert.AreEqual(8, this.tradingData.GetAmount(strategyHeader));

            Trade duplicate = new Trade(order, order.Portfolio, order.Symbol, 131010, order.Amount, BrokerDateTime.Make(DateTime.Now));
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(duplicate);

            Assert.AreEqual(8, this.tradingData.GetAmount(strategyHeader));
        }
    }
}