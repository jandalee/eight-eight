using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Csharp.Models;

namespace TRL.Csharp.Test.Models
{
    [TestClass]
    public class TradeTests
    {
        [TestMethod]
        public void Trade_constructor_test()
        {
            DateTime date = DateTime.Now;
            double price = 125000;
            double amount = 5;

            Trade trade = new Trade(date, price, amount);

            Assert.AreEqual(0, trade.Id);
            Assert.AreEqual(String.Empty, trade.Portfolio);
            Assert.AreEqual(String.Empty, trade.Symbol);
            Assert.AreEqual(date, trade.DateTime);
            Assert.AreEqual(price, trade.Price);
            Assert.AreEqual(amount, trade.Amount);
        }

        [TestMethod]
        public void Sum_of_Trade_test()
        {
            DateTime date = DateTime.Now;
            double price = 125000;
            double amount = 5;

            Trade trade = new Trade(date, price, amount);
            Assert.AreEqual(price * amount, trade.Sum);
            Assert.IsTrue(trade.Sum > 0);
        }

        [TestMethod]
        public void Sum_of_sell_Trade_test()
        {
            DateTime date = DateTime.Now;
            double price = 125000;
            double amount = -5;

            Trade trade = new Trade(date, price, amount);
            Assert.AreEqual(price * amount, trade.Sum);
            Assert.IsTrue(trade.Sum < 0);
        }

        [TestMethod]
        public void another_constructor_test()
        {
            DateTime date = DateTime.Now;
            double price = 125000;
            double amount = -5;
            string portfolio = "ST12345-RF-01";
            string symbol = "RTS-9.14";

            Trade trade = new Trade(portfolio, symbol, date, price, amount);
            Assert.AreEqual(0, trade.Id);
            Assert.AreEqual(date, trade.DateTime);
            Assert.AreEqual(price, trade.Price);
            Assert.AreEqual(amount, trade.Amount);
            Assert.AreEqual(portfolio, trade.Portfolio);
            Assert.AreEqual(symbol, trade.Symbol);
        }

        [TestMethod]
        public void constructor_with_id_test()
        {
            int id = 10;
            DateTime date = DateTime.N