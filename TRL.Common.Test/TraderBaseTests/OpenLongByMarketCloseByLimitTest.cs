using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Data;
using TRL.Common.Collections;
using TRL.Common.Models;
using TRL.Common.Test.Mocks;
using TRL.Common.TimeHelpers;
using TRL.Common.Extensions.Data;
using TRL.Emulation;
using TRL.Handlers.StopLoss;
using TRL.Handlers.TakeProfit;
using TRL.Logging;

namespace TRL.Common.Test.TraderBaseTests
{
    [TestClass]
    public class OpenLongByMarketCloseByLimitTest:TraderBaseInitializer
    {

        private StrategyHeader strategyHeader;

        [TestInitialize]
        public void Setup()
        {
            Symbol symbol = new Symbol("RTS-9.13_FT", 1, 8, 10, BrokerDateTime.Make(DateTime.Now));
            this.tradingData.Get<HashSetOfNamedMutable<Symbol>>().Add(symbol);

            this.strategyHeader = new StrategyHeader(10, "strategyHeader", "BP12345-RF-01", "RTS-9.13_FT", 10);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(this.strategyHeader);

            StopPointsSettings slSettings = new StopPointsSettings(this.strategyHeader, 300, false);
            this.tradingData.Get<ICollection<StopPointsSettings>>().Add(slSettings);

            ProfitPointsSettings tpSettings = new ProfitPointsSettings(this.strategyHeader, 500, false);
            this.tradingData.Get<ICollection<ProfitPointsSettings>>().Add(tpSettings);

            StopLossOrderSettings slOrderSettings = new StopLossOrderSettings(this.strategyHeader, 3600);
            this.tradingData.Get<ICollection<StopLossOrderSettings>>().Add(slOrderSettings);

            TakeProfitOrderSettings tpOrderSettings = new TakeProfitOrderSettings(this.strategyHeader, 3600);
            this.tradingData.Get<ICollection<TakeProfitOrderSettings>>().Add(tpOrderSettings);

            StrategyStopLossByPointsOnTick stopLossHandler =
                new StrategyStopLossByPointsOnTick(strategyHeader, this.tradingData, this.signalQueue, new NullLogger());
            StrategyTakeProfitByPointsOnTick takeProfitHandler =
                new StrategyTakeProfitByPointsOnTick(strategyHeader, this.tradingData, this.signalQueue, new NullLogger());

            PlaceStrategyStopLossByPointsOnTrade placeStopOnTradeHandler =
                new PlaceStrategyStopLossByPointsOnTrade(strategyHeader, this.tradingData, this.signalQueue, new NullLogger());
            PlaceStrategyTakeProfitByPointsOnTrade placeTakeProfitOnTradeHandler =
                new PlaceStrategyTakeProfitByPointsOnTrade(strategyHeader, this.tradingData, this.signalQueue, new NullLogger());

        }

        [TestMethod]
        public void open_long_position_with_market_order_protect_it_with_stop_and_limit_and_close_with_limit()
        {
            // Сигнал на открытие позиции
            Signal inputSignal = new Signal(this.strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 150000, 0, 0);
            EmulateTradeFor(inputSignal, 150050);

            // Заявка исполнена, позиция открыта ровно на запрошенный в заявке объем
            Assert.AreEqual(10, this.tradingData.GetAmount(this.strategyHeader));

            // Для позиции созданы и отправлены брокеру защитные стоп и тейк профит приказы
            Assert.AreEqual(3, this.tradingData.Get<IEnumerable<Signal>>().Count());
            Assert.AreEqual(3, this.tradingData.Get<IEnumerable<Order>>(