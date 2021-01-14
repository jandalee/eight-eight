using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Models;
using TRL.Common.Data;
using TRL.Common.TimeHelpers;
using TRL.Common.Collections;
using TRL.Transaction;

namespace TRL.Common.Test
{
    [TestClass]
    public class TickCollectionFactoryTests
    {
        private IDataContext tradingData;

        [TestInitialize]
        public void Setup()
        {
            this.tradingData = new TradingDataContext();
        }

        [TestMethod]
        public void TickCollectionFactory_Import()
        {
            IGenericFac