using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Models;
using TRL.Common.TimeHelpers;
using System.Globalization;

namespace TRL.Common.Test.Models
{
    [TestClass]
    public class OrderCancellationConfirmationTests
    {
        [TestMethod]
        public void OrderCancellationConfirmation_constructor_test()
        {
            Order o = new Order { Portfolio = "BP12345-RF-01", Symbol = "RTS-6.13_FT", TradeAction = TradeAction.Buy, OrderType = OrderType.Market, Amount = 10 };

            DateTime cancelDate = BrokerDateTime.Make(DateTime.Now);

            OrderCancellationConfirmation co = new OrderCancellat