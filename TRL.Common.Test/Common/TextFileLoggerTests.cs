using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.IO;
using TRL.Logging;

namespace TRL.Common.Test
{
    [TestClass]
    public class TextFileLoggerTests
    {
        private TextFileLogger logger;

        [TestInitialize]
        public void Common_Setup()
        {
            this.logger = new TextFileLogger();
        }

        [TestCleanup]
        public void Common_Teardown()
        {
            this.logger.Dispose();

            File.Delete("default-0.log");
            File.Delete("log-0.log");
            File.Delete("log-1.log");
        }

        [TestMethod]
        public void Common_LogMessage()
        {
            string message = String.Concat(DateTime.Now.ToLocalTime(), ";Тестовое сообщение в ж