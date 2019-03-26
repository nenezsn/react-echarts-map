/**
 * @author wangbing
 * @description echarts 地图
 */

import React from 'react';
import PropTypes from 'prop-types';

const echarts_url = 'http://echarts.baidu.com/gallery/vendors/echarts/echarts.min.js';
const china_url = 'http://echarts.baidu.com/gallery/vendors/echarts/map/js/china.js';
const bmap_url = 'http://echarts.baidu.com/gallery/vendors/echarts/extension/bmap.min.js'

class EchartsMap extends React.Component {

    // 创建脚本
    createScriptEl = (url) => {
        return new Promise((resolve, reject) => {
            var script = document.createElement('script');
            script.setAttribute('src', url);
            script.setAttribute('type', 'text/javascript');
            document.body.appendChild(script);
            script.onload = () => {
                resolve(1)
            }
            script.onerror = (err) => {
                resolve(0)
            }
        })
    }

    componentDidMount() {
        // 防止重复加载脚本
        const result = Array.from(document.getElementsByTagName('script')).find(item => item.getAttribute('src') == echarts_url)

        if (!result) {
            // 保证先加载echarts脚本
            this.createScriptEl(echarts_url).then(() => {
                Promise.all([this.createScriptEl(bmap_url), this.createScriptEl(china_url)]).then(data => {
                    this.init()
                }).catch(err => {
                    alert('地图加载失败'+err)
                })
            }).catch(err => {
                alert('地图加载失败'+err)
            })
        }
    }

    // 初始化
    init = () => {
        let { clickScatter, clickArea, data, geoCoordMap } = this.props

        var convertData = function (data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var geoCoord = geoCoordMap[data[i].name];
                if (geoCoord) {
                    res.push({
                        name: data[i].name,
                        value: geoCoord.concat(data[i].value)
                    });
                }
            }
            return res;
        };

        var option = {
            backgroundColor: '#404a59',
            title: {
                text: 'pbu',
                subtext: '中国地图',
                sublink: 'https://cloud.seentao.com',
                left: 'center',
                textStyle: {
                    color: '#fff'
                }
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                y: 'bottom',
                x: 'right',
                data: ['number'],
                textStyle: {
                    color: '#fff'
                },
                show: false
            },
            geo: {
                map: 'china',
                label: {
                    emphasis: {
                        show: false
                    }
                },
                roam: false,
                itemStyle: {
                    normal: {
                        areaColor: '#323c48',
                        borderColor: '#111'
                    },
                    emphasis: {
                        areaColor: '#2a333d'
                    }
                }
            },
            series: [
                {
                    name: 'pm2.5',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: convertData(data),
                    symbolSize: function (val) {
                        return val[2] / 10;
                    },
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: false
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#ddb926'
                        }
                    }
                },
                {
                    name: 'Top 5',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    data: convertData(data.sort(function (a, b) {
                        return b.value - a.value;
                    }).slice(0, 6)),
                    symbolSize: function (val) {
                        return val[2] / 10;
                    },
                    showEffectOn: 'render',
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    hoverAnimation: true,
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#f4e925',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    zlevel: 1
                }
            ]
        };

        var myChart = echarts.init(document.getElementById("container"));

        myChart.on('click', function (params) {
            if (params.componentType == 'effectScatter') {
                // 点击散点
                clickScatter(params.name)
            } else if (params.componentType = 'geo') {
                // 点击区域
                clickArea(params.name)
            }
        });
        myChart.setOption(option, true);
    }

    render() {
        const { width, height } = this.props
        return <div id='container' style={{ width: width, height: height }}></div>
    }
}



EchartsMap.propTypes = {
    /**
     * 宽
     */
    width: PropTypes.number,
    /**
     * 高
     */
    height: PropTypes.number,
    /**
     * 散点数据
     */
    data: PropTypes.array,
    /**
     * 散点经纬度
     */
    geoCoordMap: PropTypes.object,
    /**
     * 点击散点回调
     */
    clickScatter: PropTypes.func,
    /**
     * 点击区域回调
     */
    clickArea: PropTypes.func,
};

EchartsMap.defaultProps = {
    width: 500,
    height: 500,
    data: [{ name: '北京', value: 39 },{name: '武汉', value: 273}],
    geoCoordMap: { '北京': [116.46, 39.92],'武汉':[114.31,30.52]},
    clickScatter: () => { },
    clickArea: () => { },
}
export default EchartsMap