﻿using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using SmartCOM3Lib;
using System.Runtime.InteropServices;

namespace TRL.Connect.Smartcom.Test
{
    [TestClass]
    public class SmartComTests
    {
        [TestMethod]
        public void SmartCom_Is_Singleton()
        {
            StServer s = SmartCom.Instance;
            StServer s2 = SmartCom.Instance;

            Assert.AreSame(s, s2);
        }

        [TestMethod]
        public void SmartCom_GetServerLogFilePathConfigurationString_test()
        {
            Assert.AreEqual("logFilePath=C:\\Logs\\", SmartCom.GetServerLogFilePathConfigurationString());
        }

        [TestMethod]
        public void SmartCom_GetServerLogLevelConfigurationString_test()
        {
            Assert.AreEqual("logLevel=3", SmartCom.GetServerLogLevelConfigurationString());
        }

        [TestMethod]
        public void SmartCom_GetClientLogFilePathConfigurationString_test()
        {
            Assert.AreEqual("logFilePath=C:\\Logs\\", SmartCom.G