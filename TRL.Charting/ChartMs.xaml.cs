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
            var chart1 = Char