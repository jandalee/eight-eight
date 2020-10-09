using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms.DataVisualization.Charting;
using System;
using System.Windows.Forms;

//using TSL.Common.Models;
using TRL.Common.Models;

namespace TRL.Charting
{
    //using Ecng.Common;
    //using StockSharp.Algo.Candles;
    //using StockSharp.Algo.Indicators.Trend;

    //public partial class ChartMs : System.Windows.Forms.UserControl
    public partial class ChartMs// : UserControl
    {
        //private System.Windows.Forms.Timer timerRealTimeData;

        //private readonly ChartArea _chartAreaCandles;
        //private readonly ChartArea _chartAreaVolume;

        //private readonly Series _seriesCandles;
        //private readonly Series _seriesVolume;

        //private readonly IndicatorsManager _iManager;
        //private List<TimeFrameCandle> _candlesList;
        public Chart getChart { get { return this.Chart; } }
        /// <summary>
        /// Графической компонент отображения индикаторов на Candle графике
        /// </summary>
        public ChartMs()
        {
            InitializeComponent();

            //++++++++++++++++++++++++++++++++++++++++++++++++++++++++            
            //Test1()
            //++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            //this.timerRealTimeData = new System.Windows.Forms.Timer();
            //this.timerRealTimeData.Enabled = true;
            //this.timerRealTimeData.Interval = 200;
            //this.timerRealTimeData.Tick += new System.EventHandler(this.timerRealTimeData_Tick);
            //++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            
            this.Chart.KeyDown += new System.Windows.Forms.KeyEventHandler(this.chart1_KeyDown);
            this.Chart.Click += new System.EventHandler(this.chart1_Click);

            //this.Chart.Click += new System.EventHandler(this.chart1_Click);
            //this.Chart.MouseWheel += new System.Windows.Forms.MouseEventHandler(Chart_MouseWheel);
            //this.Chart.KeyDown += new System.Windows.Forms.KeyEventHandler(this.chart1_KeyDown);
            //this.chart1.KeyUp += new System.Windows.Forms.KeyEventHandler(this.chart1_KeyUp);
            /*
            var chart = Chart;

            _iManager = new IndicatorsManager();
            _iManager.RegenerateIndicators += OnRegenerateIndicator;

            chart.BackColor = System.Drawing.Color.FromArgb(211, 223, 240);
            chart.BackSecondaryColor = Color.White;
            chart.BackGradientStyle = GradientStyle.TopBottom;
            chart.BorderlineColor = Color.FromArgb(26, 59, 105);
            chart.BorderlineDashStyle = ChartDashStyle.Solid;
            chart.BorderlineWidth = 2;
            chart.BorderSkin.SkinStyle = BorderSkinStyle.Emboss;

            _chartAreaCandles = new ChartArea("ChartAreaCandles")
            {
                Area3DStyle =
                    {
                        IsClustered = true,
                        Perspective = 10,
                        IsRightAngleAxes = false,
                        WallWidth = 0,
                        Inclination = 10,
                        Rotation = 10
                    },
                AxisX =
                    {
                        IsLabelAutoFit = false,
                        LabelStyle =
                            {
                                Font = new System.Drawing.Font("Trebuchet MS", 8.25F, System.Drawing.FontStyle.Bold),
                                IsEndLabelVisible = false
                            },
                        LineColor = System.Drawing.Color.FromArgb(64, 64, 64, 64),
                        MajorGrid =
                            {
                                LineColor = System.Drawing.Color.FromArgb(64, 64, 64, 64)
                            }
                    },
                AxisY =
                    {
                        IsLabelAutoFit = false,
                        LabelStyle =
                            {
                                Font = new System.Drawing.Font("Trebuchet MS", 8.25F, System.Drawing.FontStyle.Bold)
                            },
                        LineColor = System.Drawing.Color.FromArgb(64, 64, 64, 64),
                        MajorGrid =
                            {
                                LineColor = System.Drawing.Color.FromArgb(64, 64, 64, 64)
                            },
                        IsStartedFromZero = false
                    },
                BackColor = System.Drawing.Color.FromArgb(64, 165, 191, 228),
                BackSecondaryColor = Color.White,
                BackGradientStyle = GradientStyle.TopBottom,
                BorderColor = System.Drawing.Color.FromArgb(64, 64, 64, 64),
                BorderDashStyle = ChartDashStyle.Solid,
                ShadowColor = System.Drawing.Color.Transparent
            };    

            chart.ChartAreas.Add(_chartAreaCandles);
            AddNewChartArea("ChartAreaVolume", chart);

            chart.Palette = ChartColorPalette.SemiTransparent;

            _seriesCandles = new Series("SeriesCandles")
            {
                ChartArea = "ChartAreaCandles",
                ChartType = SeriesChartType.Candlestick,
                XValueType = ChartValueType.DateTime,
                IsXValueIndexed = true
            };

            _seriesVolume = new Series("SeriesVolumes")
            {
                ChartArea = "ChartAreaVolume",
                XValueType = ChartValueType.DateTime,
                IsXValueIndexed = true,
                Color = Color.LightBlue
            };

            chart.Series.Add(_seriesCandles);
            chart.Series.Add(_seriesVolume);
            
            foreach (var indicator in _iManager.Indicators)
            {
                chart.Series.Add(indicator.IndicatorSeries);
            }
             */
        }
        /*
        void Chart_MouseWheel(object sender, System.Windows.Forms.MouseEventArgs e)
        {
            throw new NotImplementedException();
        }

        private void chart1_Click(object sender, System.EventArgs e)
        {
            var chart1 = Chart;
            // Set input focus to the chart control
            chart1.Focus();

            // set the selection start variable to that of the current position
            //this.SelectionStart = chart1.ChartAreas["Default"].CursorX.Position;
        }

        private void chart1_KeyDown(object sender, System.Windows.Forms.KeyEventArgs e)
        {
            var chart1 = Chart;            
            if ((e.KeyCode == System.Windows.Forms.Keys.Right) || (e.KeyCode == System.Windows.Forms.Keys.Left))
            {
                    ProcessScroll(e);
            }

            else if (e.KeyCode == System.Windows.Forms.Keys.Back)
            {
                // reset zoom back to previous view state
                chart1.ChartAreas["Default"].AxisX.ScaleView.ZoomReset(1);
            }

        }

        private void ProcessScroll(System.Windows.Forms.KeyEventArgs e)
        {
            var chart1 = Chart;                        
            // Process keyboard keys
            if (e.KeyCode == System.Windows.Forms.Keys.Right)
                // set the new cursor position 
                chart1.ChartAreas["Default"].CursorX.Position += chart1.ChartAreas["Default"].CursorX.Interval;

            else if (e.KeyCode == System.Windows.Forms.Keys.Left)
                // set the new cursor position 
                chart1.ChartAreas["Default"].CursorX.Position -= chart1.ChartAreas["Default"].CursorX.Interval;

            // if the cursor is outside the view, set the view
            // such that the cursor can be seen
            SetView();
        }

        private void SetView()
        {
            var chart1 = Chart;                        
            // keep the cursor from leaving the max and min a axis points
            if (chart1.ChartAreas["Default"].CursorX.Position < 0)
                chart1.ChartAreas["Default"].CursorX.Position = 0;

            else if (chart1.ChartAreas["Default"].CursorX.Position > 75)
                chart1.ChartAreas["Default"].CursorX.Position = 75;


            // move the view to keep the cursor visible
            if (chart1.ChartAreas["Default"].CursorX.Position < chart1.ChartAreas["Default"].AxisX.ScaleView.Position)
                chart1.ChartAreas["Default"].AxisX.ScaleView.Position = chart1.ChartAreas["Default"].CursorX.Position;

            else if ((chart1.ChartAreas["Default"].CursorX.Position >
                (chart1.ChartAreas["Default"].AxisX.ScaleView.Position + chart1.ChartAreas["Default"].AxisX.ScaleView.Size)))
            {
                chart1.ChartAreas["Default"].AxisX.ScaleView.Position =
                    (chart1.ChartAreas["Default"].CursorX.Position - chart1.ChartAreas["Default"].AxisX.ScaleView.Size);
            }
        }
        */

        private void chart1_Click(object sender, System.EventArgs e)
        {
            var chart1 = Chart;
            // Set input focus to the chart control
            chart1.Focus();
        }

        private void chart1_KeyDown(object sender, System.Windows.Forms.KeyEventArgs e)
        {
            var chart1 = Chart;
            // Process keyboard keys
            //if(e.KeyCode == System.Windows.Forms.Keys.Right)
            if (e.KeyCode == System.Windows.Forms.Keys.NumPad6)
            {
                chart1.ChartAreas[chartAreaDefault].AxisX.ScaleView.Scroll(ScrollType.SmallIncrement);
            }
            //else if(e.KeyCode == Keys.Left)
            else if(e.KeyCode == System.Windows.Forms.Keys.NumPad4)
            {
                chart1.ChartAreas[chartAreaDefault].AxisX.ScaleView.Scroll(ScrollType.SmallDecrement);
            }
            //else if(e.KeyCode == Keys.PageDown)
            else if (e.KeyCode == System.Windows.Forms.Keys.NumPad3)
            {
                chart1.ChartAreas[chartAreaDefault].AxisX.ScaleView.Scroll(ScrollType.LargeIncrement);
            }
            //else if(e.KeyCode == Keys.PageUp)
            else if (e.KeyCode == System.Windows.Forms.Keys.NumPad9)
            {
                chart1.ChartAreas[chartAreaDefault].AxisX.ScaleView.Scroll(ScrollType.Last);                
            }
            //else if(e.KeyCode == Keys.Home)
            else if (e.KeyCode == System.Windows.Forms.Keys.NumPad7)
            {
                chart1.ChartAreas[chartAreaDefault].AxisX.ScaleView.Scroll(ScrollType.First);
            }
            //else if(e.KeyCode == Keys.End)
            else if (e.KeyCode == System.Windows.Forms.Keys.NumPad1)            
            {
                chart1.ChartAreas[chartAreaDefault].AxisX.ScaleView.Scroll(ScrollType.LargeDecrement);
            }
            else if (e.KeyCode == System.Windows.Forms.Keys.NumPad2)
            {
                chart1.ChartAreas[chartAreaDefault].AxisY.ScaleView.Scroll(ScrollType.SmallDecrement);
            }
            else if (e.KeyCode == System.Windows.Forms.Keys.NumPad8)
            {
                chart1.ChartAreas[chartAreaDefault].AxisY.ScaleView.Scroll(ScrollType.SmallIncrement);
            }
            //else if (e.KeyCode == System.Windows.Forms.Keys.Back)
            else if (e.KeyCode == System.Windows.Forms.Keys.Space)
            {
                // reset zoom back to previous view state
                chart1.ChartAreas[chartAreaDefault].AxisX.ScaleView.ZoomReset(1);
                chart1.ChartAreas[chartAreaDefault].AxisY.ScaleView.ZoomReset(1);
            }
        }


        private void OnRegenerateIndicator()
        {
            /*
            foreach (var indicatorDetails in _iManager.Indicators)
            {
                indicatorDetails.IndicatorSeries.Points.Clear();
            }
            _iManager.AddPoints(this._candlesList);
             */
        }
        /*
        public void AddCandle(TimeFrameCandle candle)
        {
            Trace.WriteLine("Adding candle: " + candle.Time);
            Trace.Flush();

            _seriesVolume.Points.Add(new BaseValue
            {
                XValue = candle.Time.ToOADate(),
                YValues = new [] { candle.CloseVolume.To<double>() }
            });

            var candleSb = new StringBuilder();
            candleSb.Append(candle.LowPrice.ToString().Replace(',', '.')).Append(',');
            candleSb.Append(candle.HighPrice.ToString().Replace(',', '.')).Append(',');
            candleSb.Append(candle.OpenPrice.ToString().Replace(',', '.')).Append(',');
            candleSb.Append(candle.ClosePrice.ToString().Replace(',', '.'));
            var pointCandle = new BaseValue(candle.Time.ToOADate(), candleSb.ToString());

            pointCandle["PriceUpColor"] = "Green";
            pointCandle["PriceDownColor"] = "Red";
            pointCandle.BorderColor = Color.DarkSlateGray;

            _seriesCandles.Points.Add(pointCandle);

            // get max/min y values in bounded set
            var maxY = _seriesCandles.Points.Max(x => x.YValues[1]);
            var minY = _seriesCandles.Points.Min(x => x.YValues[0]);

            // pad max/min y values
            _chartAreaCandles.AxisY.Maximum = maxY + ((maxY - minY) * 0.05);
            _chartAreaCandles.AxisY.Minimum = minY - ((maxY - minY) * 0.05);

            _iManager.AddPoint(candle);
        }

        public void AddCandles(List<TimeFrameCandle> candlesList)
        {
            _candlesList = candlesList;

            foreach (var candle in _candlesList)
            {
                AddCandle(candle);
            }
        }
        */
        public void AddNewChartArea(string name, Chart chart)
        {
            var chartArea = new ChartArea
            {
                Name = name,
                AlignWithChartArea = "ChartAreaCandles",
                Area3DStyle =
                {
                    IsClustered = true,
                    Perspective = 10,
                    IsRightAngleAxes = false,
                    WallWidth = 0,
                    Inclination = 10,
                    Rotation = 10
                },
                AxisX =
                {
                    IntervalType = DateTimeIntervalType.Minutes,
                    IsLabelAutoFit = false,
                    LabelStyle =
                    {
                        Font = new System.Drawing.Font("Trebuchet MS", 8.25F, System.Drawing.FontStyle.Bold),
                        IsEndLabelVisible = false,
                        Format = "HH:mm"
                    },
                    LineColor = System.Drawing.Color.FromArgb(64, 64, 64, 64),
                    MajorGrid =
                    {
                        LineColor = System.Drawing.Color.FromArgb(64, 64, 64, 64)
                    }
                },
                AxisY =
                {
                    IsLabelAutoFit = false,
                    LabelStyle =
                    {
                        Font = new System.Drawing.Font("Trebuchet MS", 8.25F, System.Drawing.FontStyle.Bold)
                    },
                    LineColor = System.Drawing.Color.FromArgb(64, 64, 64, 64),
                    MajorGrid =
                    {
                        LineColor = System.Drawing.Color.FromArgb(64, 64, 64, 64)
                    },
                    IsStartedFromZero = false
                },
                BackColor = System.Drawing.Color.FromArgb(64, 165, 191, 228),
                BackSecondaryColor = Color.White,
                BackGradientStyle = GradientStyle.TopBottom,
                BorderColor = System.Drawing.Color.FromArgb(64, 64, 64, 64),
                BorderDashStyle = ChartDashStyle.Solid,
                ShadowColor = System.Drawing.Color.Transparent
            };

            chart.ChartAreas.Add(chartArea);
        }
        /*
        public IndicatorsManager GetIndicatorsManager()
        {
            return _iManager;
        }         
         */
        public void Test1()
        {
            var chart1 = Chart;

            // Create Chart Area
            ChartArea chartArea1 = new ChartArea("Default");

            // Add Chart Area to the Chart
            chart1.ChartAreas.Add(chartArea1);

            // Create a data series
            Series series1 = new Series();
            Series series2 = new Series();

            // Add data points to the first series
            series1.Points.Add(34);
            series1.Points.Add(24);
            series1.Points.Add(32);
            series1.Points.Add(28);
            series1.Points.Add(44);

            // Add data points to the second series
            series2.Points.Add(14);
            series2.Points.Add(44);
            series2.Points.Add(24);
            series2.Points.Add(32);
            series2.Points.Add(28);

            // Add series to the chart
            chart1.Series.Add(series1);
            chart1.Series.Add(series2);            
        }

        public void Test2()
        {
            var chart1 = Chart;

            // Create Chart Area
            //ChartArea chartArea1 = new ChartArea();
            ChartArea chartArea1 = new ChartArea("ChartAreaCandles");

            // Add Chart Area to the Chart
            chart1.ChartAreas.Add(chartArea1);

            // Create a data series
            //Series series1 = new Series();
            Series series1 = new Series("Series 1");
            Series series2 = new Series();

            // Add series to the chart
            chart1.Series.Add(series1);
            chart1.Series.Add(series2);


            // Set series chart type
            //chart1.Series["Series 1"].ChartType = SeriesChartType.Stock;
            chart1.Series["Series 1"].ChartType = SeriesChartType.Candlestick;
            // Set the style of the open-close marks
            //chart1.Series["Series 1"]["OpenCloseStyle"] = "Triangle";
            // Show both open and close marks
            //chart1.Series["Series 1"]["ShowOpenClose"] = "Both";
            // Set point width
            //chart1.Series["Series 1"]["PointWidth"] = "1.0";
            
            // Create a new random number generator
            System.Random rnd = new System.Random();

            // Data points X value is using current date
            System.DateTime date = System.DateTime.Now.Date;

            // Add points to the stock chart series
            for (int index = 0; index < 10; index++)
            {
                chart1.Series["Series 1"].Points.AddXY(
                    date,                // X value is a date
                    rnd.Next(40, 50),    // High Y value
                    rnd.Next(10, 20),    // Low Y value
                    rnd.Next(20, 40),    // Open Y value
                    rnd.Next(20, 40));    // Close Y value

                // Add 1 day to our X value
                date = date.AddDays(1);
            }
        }

        public void Test3()
        {
            var chart1 = Chart;

            // Create Chart Area
            //ChartArea chartArea1 = new ChartArea();
            ChartArea chartArea1 = new ChartArea("Default");
            ChartArea chartArea2 = new ChartArea("Volume");
            // Add Chart Area to the Chart
            chart1.ChartAreas.Add(chartArea1);
            // Add Chart Area to the Chart
            chart1.ChartAreas.Add(chartArea2);


            // First set the ChartArea.InnerPlotPosition property.
            chart1.ChartAreas["Default"].InnerPlotPosition.Auto = true;
            chart1.ChartAreas["Volume"].InnerPlotPosition.Auto = true;
            
            // Выравние ChartAreas
            // Set the alignment properties so the "Volume" chart area will allign to "Default"
            chart1.ChartAreas["Volume"].AlignmentOrientation = AreaAlignmentOrientations.Vertical;
            chart1.ChartAreas["Volume"].AlignmentStyle = AreaAlignmentStyles.All;
            chart1.ChartAreas["Volume"].AlignWithChartArea = "Default";

            //Настройка Скролбара
            chart1.ChartAreas["Default"].AxisX.ScrollBar.Size = 20;
            chart1.ChartAreas["Default"].AxisX.ScrollBar.IsPositionedInside = true;
            //chart1.ChartAreas["Default"].AxisX.ScrollBar.Buttons = ScrollBarButtonStyle.SmallScroll;
            chart1.ChartAreas["Default"].AxisX.ScrollBar.Enabled = true;

            //chart1.ChartAreas["Volume"].AxisX.ScrollBar.Size = 20;
            //chart1.ChartAreas["Volume"].AxisX.ScrollBar.IsPositionedInside = false;
            //chart1.ChartAreas["Volume"].AxisX.ScrollBar.Buttons = ScrollBarButtonStyle.SmallScroll;
            chart1.ChartAreas["Volume"].AxisX.ScrollBar.Enabled = false;

            //Настройка Курсора
            chartArea1.CursorX.IsUserEnabled = true;
            chartArea1.CursorX.IsUserSelectionEnabled = true;
            //chartArea1.CursorX.SelectionColor = System.Drawing.Color.PaleGoldenrod;
            //chartArea1.CursorY.IsUserEnabled = true;

            chartArea2.CursorX.IsUserEnabled = true;
            chartArea2.CursorX.IsUserSelectionEnabled = true;
            //chartArea2.CursorX.SelectionColor = System.Drawing.Color.PaleGoldenrod;
            //chartArea2.CursorY.IsUserEnabled = true;
            
            // Create a data series
            //Series series1 = new Series();
            Series series1 = new Series("Channel 1");
            Series series2 = new Series("Channel 2");
            series2.ChartArea = "Volume";

            // Add series to the chart
            chart1.Series.Add(series1);
            chart1.Series.Add(series2);

            //chart1.Series["Channel 1"].ChartType = SeriesChartType.FastLine;
            //chart1.Series["Channel 2"].ChartType = SeriesChartType.FastLine;

            chart1.Series["Channel 1"].ChartType = SeriesChartType.Line;
            //chart1.Series["Channel 2"].ChartType = SeriesChartType.Line;

            //chart1.Series["Channel 1"].ChartType = SeriesChartType.Column;
            chart1.Series["Channel 2"].ChartType = SeriesChartType.Column;

            // Set auto minimum and maximum values.
            chart1.ChartAreas["Default"].AxisY.Minimum = Double.NaN;
            chart1.ChartAreas["Default"].AxisY.Maximum = Double.NaN;

            // Set primary x-axis properties
            chart1.ChartAreas["Default"].AxisX.LabelStyle.Interval = Math.PI;
            chart1.ChartAreas["Default"].AxisX.LabelStyle.Format = "##.##";
            chart1.ChartAreas["Default"].AxisX.MajorGrid.Interval = Math.PI;
            chart1.ChartAreas["Default"].AxisX.MinorGrid.Interval = Math.PI / 4;
            chart1.ChartAreas["Default"].AxisX.MinorTickMark.Interval = Math.PI / 4;
            chart1.ChartAreas["Default"].AxisX.MajorTickMark.Interval = Math.PI;
            chart1.ChartAreas["Default"].AxisY.MinorGrid.Interval = 0.25;
            chart1.ChartAreas["Default"].AxisY.MajorGrid.Interval = 0.5;
            chart1.ChartAreas["Default"].AxisY.LabelStyle.Interval = 0.5;

            // Add data points to the series that have the specified X and Y values
            for (double t = 0; t <= (10 * Math.PI); t += Math.PI / 6)
            {
                double ch1 = Math.Sin(t);
                double ch2 = Math.Sin(t - Math.PI / 2);
                chart1.Series["Channel 1"].Points.AddXY(t, ch1);
                chart1.Series["Channel 2"].Points.AddXY(t, ch2);
            }
        }

        public void Test4()
        {
            var chart1 = Chart;

            // Create Chart Area
            //ChartArea chartArea1 = new ChartArea();
            ChartArea chartArea1 = new ChartArea("Default");
            ChartArea chartArea2 = new ChartArea("Volume");
            // Add Chart Area to the Chart
            chart1.ChartAreas.Add(chartArea1);
            // Add Chart Area to the Chart
            chart1.ChartAreas.Add(chartArea2);


            // First set the ChartArea.InnerPlotPosition property.
            chart1.ChartAreas["Default"].InnerPlotPosition.Auto = true;
            chart1.ChartAreas["Volume"].InnerPlotPosition.Auto = true;

            // Выравние ChartAreas
            // Set the alignment properties so the "Volume" chart area will allign to "Default"
            chart1.ChartAreas["Volume"].AlignmentOrientation = AreaAlignmentOrientations.Vertical;
            chart1.ChartAreas["Volume"].AlignmentStyle = AreaAlignmentStyles.All;
            chart1.ChartAreas["Volume"].AlignWithChartArea = "Default";

            //Настройка Скролбара
            chart1.ChartAreas["Default"].AxisX.ScrollBar.Size = 20;
            chart1.ChartAreas["Default"].AxisX.ScrollBar.IsPositionedInside = true;
            //chart1.ChartAreas["Default"].AxisX.ScrollBar.Buttons = ScrollBarButtonStyle.SmallScroll;
            chart1.ChartAreas["Default"].AxisX.ScrollBar.Enabled = true;

            //chart1.ChartAreas["Volume"].AxisX.ScrollBar.Size = 20;
            //chart1.ChartAreas["Volume"].AxisX.ScrollBar.IsPositionedInside = false;
            //chart1.ChartAreas["Volume"].AxisX.ScrollBar.Buttons = ScrollBarButtonStyle.SmallScroll;
            chart1.ChartAreas["Volume"].AxisX.ScrollBar.Enabled = false;

            //Настройка Курсора
            chartArea1.CursorX.IsUserEnabled = true;
            chartArea1.CursorX.IsUserSelectionEnabled = true;
            //chartArea1.CursorX.SelectionColor = System.Drawing.Color.PaleGoldenrod;
            //chartArea1.CursorY.IsUserEnabled = true;

            chartArea2.CursorX.IsUserEnabled = true;
            chartArea2.CursorX.IsUserSelectionEnabled = true;
            //chartArea2.CursorX.SelectionColor = System.Drawing.Color.PaleGoldenrod;
            //chartArea2.CursorY.IsUserEnabled = true;

            // Create a data series
            //Series series1 = new Series();
            Series series1 = new Series("Channel 1");
            Series series2 = new Series("Volume");
            series2.ChartArea = "Volume";
            

            // Add series to the chart
            chart1.Series.Add(series1);
            chart1.Series.Add(series2);

            //chart1.Series["Channel 1"].ChartType = SeriesChartType.FastLine;
            //chart1.Series["Channel 2"].ChartType = SeriesChartType.FastLine;

            //chart1.Series["Channel 1"].ChartType = SeriesChartType.Line;
            //chart1.Series["Channel 2"].ChartType = SeriesChartType.Line;

            //chart1.Series["Channel 1"].ChartType = SeriesChartType.Column;
            //chart1.Series["Channel 2"].ChartType = SeriesChartType.Column;

            //chart1.Series["Channel 1"].ChartType = SeriesChartType.Stock;
            chart1.Series["Channel 1"].ChartType = SeriesChartType.Candlestick;
            chart1.Series["Volume"].ChartType = SeriesChartType.Column;
            // Set series point width   // Ширина колонок Объема            
            chart1.Series["Volume"]["PointWidth"] = "0.2";

            // Set auto minimum and maximum values.
            //chart1.ChartAreas["Default"].AxisY.Minimum = Double.NaN;
            //chart1.ChartAreas["Default"].AxisY.Maximum = Double.NaN;

            RandomStockData(chart1.Series["Channel 1"], chart1.Series["Volume"]);
        }

        public void Test5()
        {
            var chart1 = Chart;

            // Create Chart Area
            //ChartArea chartArea1 = new ChartArea();
            ChartArea chartArea1 = new ChartArea("Default");
            ChartArea chartArea2 = new ChartArea("Volume");
            // Add Chart Area to the Chart
            chart1.ChartAreas.Add(chartArea1);
            // Add Chart Area to the Chart
            chart1.ChartAreas.Add(chartArea2);


            // First set the ChartArea.InnerPlotPosition property.
            chart1.ChartAreas["Default"].InnerPlotPosition.Auto = true;
            chart1.ChartAreas["Volume"].InnerPlotPosition.Auto = true;

            // Выравние ChartAreas
            // Set the alignment properties so the "Volume" chart area will allign to "Default"
            chart1.ChartAreas["Volume"].AlignmentOrientation = AreaAlignmentOrientations.Vertical;
            chart1.ChartAreas["Volume"].AlignmentStyle = AreaAlignmentStyles.All;
            chart1.ChartAreas["Volume"].AlignWithChartArea = "Default";

            //Настройка Скролбара
            chart1.ChartAreas["Default"].AxisX.ScrollBar.Size = 20;
            chart1.ChartAreas["Default"].AxisX.ScrollBar.IsPositionedInside = true;
            //chart1.ChartAreas["Default"].AxisX.ScrollBar.Buttons = ScrollBarButtonStyle.SmallScroll;
            chart1.ChartAreas["Default"].AxisX.ScrollBar.Enabled = true;

            //chart1.ChartAreas["Volume"].AxisX.ScrollBar.Size = 20;
            //chart1.ChartAreas["Volume"].AxisX.ScrollBar.IsPositionedInside = false;
            //chart1.ChartAreas["Volume"].AxisX.ScrollBar.Buttons = ScrollBarButtonStyle.SmallScroll;
            chart1.ChartAreas["Volume"].AxisX.ScrollBar.Enabled = false;

            //Настройка Курсора
            chartArea1.CursorX.IsUserEnabled = true;
            chartArea1.CursorX.IsUserSelectionEnabled = true;
            //chartArea1.CursorX.SelectionColor = System.Drawing.Color.PaleGoldenrod;
            //chartArea1.CursorY.IsUserEnabled = true;

            chartArea2.CursorX.IsUserEnabled = true;
            chartArea2.CursorX.IsUserSelectionEnabled = true;
            //chartArea2.CursorX.SelectionColor = System.Drawing.Color.PaleGoldenrod;
            //chartArea2.CursorY.IsUserEnabled = true;

            // Create a data series
            //Series series1 = new Series();
            Series series1 = new Series("Channel 1");
            Series series2 = new Series("Volume");
            series2.ChartArea = "Volume";


            // Add series to the chart
            chart1.Series.Add(series1);
            chart1.Series.Add(series2);

            //chart1.Series["Channel 1"].ChartType = SeriesChartType.FastLine;
            //chart1.Series["Channel 2"].ChartType = SeriesChartType.FastLine;

            //chart1.Series["Channel 1"].ChartType = SeriesChartType.Line;
            //chart1.Series["Channel 2"].ChartType = SeriesChartType.Line;

            //chart1.Series["Channel 1"].ChartType = SeriesChartType.Column;
            //chart1.Series["Channel 2"].ChartType = SeriesChartType.Column;

            //chart1.Series["Channel 1"].ChartType = SeriesChartType.Stock;
            chart1.Series["Channel 1"].ChartType = SeriesChartType.Candlestick;
            chart1.Series["Volume"].ChartType = SeriesChartType.Column;
            // Set series point width   // Ширина колонок Объема            
            chart1.Series["Volume"]["PointWidth"] = "0.2";

            // Set auto minimum and maximum values.
            //chart1.ChartAreas["Default"].AxisY.Minimum = Double.NaN;
            //chart1.ChartAreas["Default"].AxisY.Maximum = Double.NaN;

            RandomStockData(chart1.Series["Channel 1"], chart1.Series["Volume"]);
        }


        public string chartAreaDefault = "ChartAreaCandle";
        public string chartAreaVolume = "ChartAreaVolume";
        public string chartAreaSignal = "ChartAreaSignal";

        public void CreateChart()
        {
            var chart1 = this.Chart;

            // Create Chart Area
            //ChartArea chartArea1 = new ChartArea();
            ChartArea chartArea1 = new ChartArea(chartAreaDefault);
            ChartArea chartArea2 = new ChartArea(chartAreaVolume);
        