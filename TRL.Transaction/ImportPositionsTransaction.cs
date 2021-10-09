﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TRL.Common.Data;
using System.IO;
using TRL.Common.Models;

namespace TRL.Transaction
{
    public class ImportPositionsTransaction:ITransaction
    {
        private IObservableHashSetFactory tradingData;
        private string importFileName;

        private ImportPositionsTransaction() { }

        public ImportPositionsTransaction(IObservableHashSetFactory tradingData, string importFileName)
        {
            this.tradingData = tradingData;
            this.importFileName = importFileName;
        }

        public void Execute()
        {
            if (!File.Exists(this.importFileName))
                return;

            StreamReader streamReader = new StreamReader(this.importFileName);
            StringReader stringReader = new StringReader(streamReader.ReadToEnd());

            while (true)
            {
                string line = stringReader.ReadLine();

                if (!string.IsNullOrEmpty(line) && !string.IsNullOrWhiteSpace(line))
                {
                    try
      