﻿using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Data;
using TRL.Common.Collections;
using TRL.Common.Models;
using TRL.Common.Test.Mocks;
using TRL.Common.TimeHelpers;
using TRL.Emulation;
using TRL.Handlers.StopLoss;
using TRL.Handlers.TakeProfit;
using TRL.Logging;
using TRL.Common.Handlers;

namespace TRL.Common.Test.TraderBaseTests
{
    [TestClass]
    public class OpenLongByMarketCloseByStopMultipleTradesTest
    {
        private IDataContext tradingData;
        private ObservableQueue<Signal> signalQueue;
        private ObservableQueue<Order> orderQueue;
        private IOrderManager orderManager;

        [TestInitialize]
        public void Setup()
        {
            this.tradingData = new TradingDataContext();
            this.signalQueue = new ObservableQueue<Signal>();
            this.orderQueue = new ObservableQueue<Order>();
            this.orderManager = new MockOrderManager();

            TraderBase traderBase = new TraderBase(this.tradingData, this.signalQueue, this.orderQueue, this.orderManager, new AlwaysTimeToTradeSchedule(), new NullLogger());
        }

        [TestMethod]
        public void open_long_position_with_market_order_protect_it_with_stop_and_limit_and_close_with_stop_multiple_trades()
        {
            // Настройки для торгуемой стратегии
            Symbol symbol = new Symbol("RTS-9.13_FT", 1, 8, 10, BrokerDateTime.Make(DateTime.Now));         
            this.tradingData.Get<ICollection<Symbol>>().Add(symbol);

            StrategyHeader strategyHeader = new StrategyHeader(1, "strategyHeader", "BP12345-RF-01", "RTS-9.13_FT", 10);                
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(strategyHeader);

            StopPointsSettings slSettings = new StopPointsSettings(strategyHeader, 300, false);
            this.tradingData.Get<ICollection<StopPointsSettings>>().Add(slSettings);

            ProfitPointsSettings tpSettings = new ProfitPointsSettings(strategyHeader, 500, false);
            this.tradingData.Get<ICollection<ProfitPointsSettings>>().Add(tpSettings);

            StopLossOrderSettings slOrderSettings = new StopLossOrderSettings(strategyHeader, 3600);
            this.tradingData.Get<ICollection<StopLossOrderSettings>>().Add(slOrderSettings);

            TakeProfitOrderSettings tpOrderSettings = new TakeProfitOrderSettings(strategyHeader, 3600);
            this.tradingData.Get<ICollection<TakeProfitOrderSettings>>().Add(tpOrderSettings);

            StrategyStopLossByPointsOnTick stopLossHandler =
                new StrategyStopLossByPointsOnTick(strategyHeader, this.tradingData, this.signalQueue, new NullLogger(), true);
            StrategyTakeProfitByPointsOnTick takeProfitHandler =
                new StrategyTakeProfitByPointsOnTick(strategyHeader, this.tradingData, this.signalQueue, new NullLogger(), true);

            PlaceStrategyStopLossByPointsOnTrade placeStopOnTradeHandler =
                new PlaceStrategyStopLossByPointsOnTrade(strategyHeader, this.tradingData, this.signalQueue, new NullLogger(), true);
            PlaceStrategyTakeProfitByPointsOnTrade placeTakeProfitOnTradeHandler =
                new PlaceStrategyTakeProfitByPointsOnTrade(strategyHeader, this.tradingData, this.signalQueue, new NullLogger(), true);


            // Сигнал на открытие позиции
            Signal inputSignal = new Signal(strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 150000, 0, 0);
            this.signalQueue.Enqueue(inputSignal);

            // Сигнал успешно обработан и заявка отправлена брокеру
            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Signal>>().Count());
            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Order>>().Count());

            // Копия отправленной брокеру заявки на открытие позиции
            Order inputOrder = this.tradingData.Get<IEnumerable<Order>>().Last();

            // Брокер подтвердил получение заявки
            this.tradingData.Get<ObservableHashSet<OrderDeliveryConfirmation>>().Add(new OrderDeliveryConfirmation(inputOrder, BrokerDateTime.Make(DateTime.Now)));
            Assert.IsTrue(inputOrder.IsDelivered);

            // Брокер исполнил заявку несколькими сделками
            Trade inputTrade = new Trade(inputOrder, inputOrder.Portfolio, inputOrder.Symbol, 150050, 3, BrokerDateTime.Make(DateTime.Now));
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(inputTrade);

            // Часть заявки исполнена, позиция открыта ровно на исполненный сделкой объем
            Assert.IsFalse(inputOrder.IsFilled);
            Assert.IsTrue(inputOrder.IsFilledPartially);
            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Position>>().Count());
            Position position = this.tradingData.Get<IEnumerable<Position>>().Last();
            Assert.AreEqual(3, position.Amount);

            // Заявки на приказы stop loss и take profit не генерируются, поскольку рыночная заявка не исполнена
            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Signal>>().Count());
            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Order>>().Count());

            // Следующая сделка
            Trade t2 = new Trade(inputOrder, inputOrder.Portfolio, inputOrder.Symbol, 150060, 5, BrokerDateTime.Make(DateTime.Now));
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(t2);

            // Часть заявки исполнена, позиция увеличилась ровно на исполненный сделкой объем
            Assert.IsFalse(inputOrder.IsFilled);
            Assert.IsTrue(inputOrder.IsFilledPartially);
            Assert.AreEqual(8, position.Amount);

            // Заявки на приказы stop loss и take profit не генерируются, поскольку рыночная заявка не исполнена
            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Signal>>().Count());
            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Order>>().Count());

            // Следующая сделка
            Trade t3 = new Trade(inputOrder, inputOrder.Portfolio, inputOrder.Symbol, 150070, 2, BrokerDateTime.Make(DateTime.Now));
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(t3);

            // Заявка полностью исполнена, позиция увеличилась ровно на исполненный сделкой объем
            Assert.IsTrue(inputOrder.IsFilled);
            Assert.IsFalse(inputOrder.IsFilledPartially);
            Assert.AreEqual(10, position.Amount);

            // Для позиции созданы и отправлены брокеру защитные стоп и тейк профит приказы
            Assert.AreEqual(3, this.tradingData.Get<IEnumerable<Signal>>().Count());
            Assert.AreEqual(3, this.tradingData.Get<IEnumerable<Order>>().Count());
            Order slOrder = this.tradingData.Get<IEnumerable<Order>>().Single(o => o.OrderType == OrderType.Stop);
            Order tpOrder = this.tradingData.Get<IEnumerable<Order>>().Single(o => o.OrderType == OrderType.Limit);

            // Цена защитных приказов установлена соответственно настройкам
            Assert.AreEqual(149700, slOrder.Stop);
            Assert.AreEqual(150500, tpOrder.Price);

            // Брокер подтверждает получение защитных приказов
            this.tradingData.Get<ObservableHashSet<OrderDeliveryConfirmation>>().Add(new OrderDeliveryConfirmation(slOrder, BrokerDateTime.Make(DateTime.Now)));
            this.tradingData.Get<ObservableHashSet<OrderDeliveryConfirmation>>().Add(new OrderDeliveryConfirmation(tpOrder, BrokerDateTime.Make(DateTime.Now)));
            Assert.IsTrue(slOrder.IsDelivered);
            Assert.IsTrue(tpOrder.IsDelivered);

            // Через некоторое время цена на рынке падает, срабатывает защитный стоп приказ и исполняется первая сделка
            Trade outputTrade = new Trade(slOrder, slOrder.Portfolio, slOrder.Symbol, 149680, -4, BrokerDateTime.Make(DateTime.Now));
            tradingData.Get<ObservableHashSet<Trade>>().Add(outputTrade);

            // Стоп приказ исполнен лишь частично. Позиция не закрыта. Take profit приказ не отменен
            Assert.IsFalse(slOrder.IsFilled);
            Assert.IsTrue(slOrder.IsFilledPartially);
            Assert.AreEqual(6, position.Amount);
            Assert.IsFalse(tpOrder.IsCanceled);

            // Исполняется вторая сделка
            Trade ot2 = new Trade(slOrder, slOrder.Portfolio, slOrder.Symbol, 149670, -5, BrokerDateTime.Make(DateTime.Now));
            tradingData.Get<ObservableHashSet<Trade>>().Add(ot2);

            // Стоп приказ исполнен лишь частично. Позиция не закрыта. Take profit приказ не отменен
            Assert.IsFalse(slOrder.IsFilled);
            Assert.IsTrue(slOrder.IsFilledPartially);
            Assert.AreEqual(1, position.Amount);
            Assert.IsFalse(tpOrder.IsCanceled);

            // Исполняется третья сделка
            Trade ot3 = new Trade(slOrder, slOrder.Portfolio, slOrder.Symbol, 149680, -1, BrokerDateTime.Make(DateTime.Now));
            tradingData.Get<ObservableHashSet<Trade>>().Add(ot3);

            // Стоп приказ исполнен
            Assert.IsTrue(slOrder.IsFilled);
            Assert.IsFalse(tpOrder.IsFilled);
            Assert.IsFalse(tpOrder.IsCanceled);

            // Позиция закрыта
            Assert.AreEqual(0, position.Amount);

            // Брокеру отправлен запрос на отмену приказа take profit
            Assert.AreEqual(1, this.tradingData.Get<ObservableHashSet<OrderCancellationRequest>>().Count);

            // Брокер подтверждает получение заявки на отмену приказа
            this.tradingData.Get<ObservableHashSet<OrderCancellationConfirmation>>().Add(new OrderCancellationConfirmation(tpOrder, BrokerDateTime.Make(DateTime.Now), "Заявка снята"));
            Assert.IsTrue(tpOrder.IsCanceled);

        }
    }
}
