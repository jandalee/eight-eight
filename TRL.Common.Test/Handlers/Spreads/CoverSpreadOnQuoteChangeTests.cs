using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Collections;
using TRL.Common.Models;
using TRL.Common.Data;
using TRL.Common.Test.Mocks;
using TRL.Common.TimeHelpers;
using TRL.Common.Handlers;
using TRL.Handlers.Spreads;
using TRL.Emulation;
using TRL.Logging;

namespace TRL.Common.Handlers.Test.Spreads
{
    [TestClass]
    public class CoverSpreadOnQuoteChangeTests : TraderBaseInitializer
    {
        private OrderBookContext qProvider;
        private SpreadSettings spreadSettings;
        private List<StrategyHeader> leftLeg, rightLeg;

        [TestInitialize]
        public void Setup()
        {

            this.qProvider = new OrderBookContext();
            this.spreadSettings = new SpreadSettings(1.35, 1.48, 1.18);
            
            this.leftLeg = new List<StrategyHeader>();
            this.leftLeg.Add(this.tradingData.Get<IEnumerable<StrategyHeader>>().Single(s => s.Id == 1));

            this.rightLeg = new List<StrategyHeader>();
            this.rightLeg.Add(this.tradingData.Get<IEnumerable<StrategyHeader>>().Single(s => s.Id == 2));
            this.rightLeg.Add(this.tradingData.Get<IEnumerable<StrategyHeader>>().Single(s => s.Id == 3));

            CoverSpreadOnQuoteChange handler =
                new CoverSpreadOnQuoteChange(this.qProvider,
                    this.leftLeg,
                    this.rightLeg,
                    this.spreadSettings,
                    this.tradingData,
                    this.signalQueue,
                    new NullLogger());
        }

        [TestMethod]
        public void CoverSpreadOnQuote_make_signals_to_close_existing_position()
        {
            StrategyHeader strtgy = this.tradingData.Get<IEnumerable<StrategyHeader>>().Single(s => s.Id == 1);

            Signal sgnl = new Signal(strtgy, BrokerDateTime.Make(DateTime.Now), TradeAction.Sell, OrderType.Market, 140000, 0, 0);
            this.tradingData.Get<ICollection<Signal>>().Add(sgnl);

            Order ordr = new Order(sgnl);
            this.tradingData.Get<ICollection<Order>>().Add(ordr);

            OrderDeliveryConfirmation cnfrmtn = new OrderDeliveryConfirmation(ordr, BrokerDateTime.Make(DateTime.Now));
            this.tradingData.Get<ObservableHashSet<OrderDeliveryConfirmation>>().Add(cnfrmtn);
            Assert.IsTrue(ordr.IsDelivered);

            Trade trd = new Trade(ordr, ordr.Portfolio, ordr.Symbol, 1430000, -ordr.Amount, BrokerDateTime.Make(DateTime.Now));
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(trd);
            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Position>>().Count());


            StrategyHeader strategy2 = this.tradingData.Get<IEnumerable<StrategyHeader>>().Single(s => s.Id == 2);

            Signal signal2 = new Signal(strategy2, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 31000, 0, 0);
            this.tradingData.Get<ICollection<Signal>>().Add(signal2);

            Order order2 = new Order(signal2);
            this.tradingData.Get<ICollection<Order>>().Add(order2);

            OrderDeliveryConfirmation confirmation2 = new OrderDeliveryConfirmation(order2, BrokerDateTime.Make(DateTime.Now));
            this.tradingData.Get<ObservableHashSet<OrderDeliveryConfirmation>>().Add(confirmation2);
            Assert.IsTrue(order2.IsDelivered);

            Trade trade2 = new Trade(order2, order2.Portfolio, order2.Symbol, 31000, order2.Amount, BrokerDateTime.Make(DateTime.Now));
            this.tradingData.Get<ObservableHashSet<Trade>>().Add(trade2);
            Assert.AreEqual(2, this.tradingData.Get<IEnumerable<Position>>().Count());


            StrategyHeader strategy3 = this.tradingData.Get<IEnumerable<StrategyHeader>>().Single(s => s.Id == 3);

            Signal signal3 = new Signal(strategy3, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 41000, 0, 0);
            this.tradingData.Get<ICollection<Signal>>().Add(signal3);

            Order order3 = new Order(signal3);
            this.tradingData.Get<ICollection<Order>>().Add(order3);

            OrderDeliveryConfirmation confirmation3 = new OrderDeliveryConfirmation(order3, BrokerDateTime.Make(DateTime.Now));
            this.tradingData.Get<ObservableHashSet<OrderDeliveryConfirmation>>().Add(confirmation3);
            Assert.IsTrue(order3.IsDelivered);

            Trade trade3 = new Trade(order3, order3.Portfolio, order3.Symbo