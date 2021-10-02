using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace TRL.Csharp.Test
{
    [TestClass]
    public class DateTimeTests
    {
        public DateTime DateTime;

        [TestMethod]
        public void default_DateTime_test()
        {
            Assert.AreEqual(1, DateTime.Year);
            Assert.AreEqual(1, DateTime.Month);
            Assert.AreEqual(1, DateTime.Day);

            Assert.AreEqual(0, DateTime.Hour);
            Assert.AreEqual(0, DateTime.Minute);
            Assert.AreEqual(0, DateTime.Second);
            Assert.AreEqual(DateTime.MinValue, DateTime);
        }

        [TestMethod]
        public void initialize_DateTime_test()
        {
            DateTime = DateTime.Now;

            Assert.AreNotEqual(DateTime.MinValue, DateTime);
            Assert.AreNotEqual(DateTime.MaxValue, DateTime);
        }

        [TestMethod]
        public void construct_DateTime_test()
        {
            DateTime = new DateTime(2014, 7, 31, 10, 5, 35);

            Assert.AreEqual(2014, DateTime.Year);
            Assert.AreEqual(7, DateTime.Month);
            Assert.AreEqual(31, DateTime.Day);

            Assert.AreEqual(10, DateTime.Hour);
            Assert.AreEqual(5, DateTime.Minute);
            Ass