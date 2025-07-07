// layers.js
define([
  "esri/layers/FeatureLayer",
  "esri/layers/GroupLayer",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleMarkerSymbol"
], function(
  FeatureLayer, GroupLayer, SimpleRenderer, SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol
) {

  // Helper: 河水堰復舊 點+面小組
  function createWeirSet(title, pointUrl, polygonUrl) {
    const pointLayer = new FeatureLayer({
      url: pointUrl,
      title: title + " (點)",
      visible: true,
      renderer: new SimpleRenderer({
        symbol: new SimpleMarkerSymbol({
          style: "diamond",
          size: 14,
          color: [180,0,255,0.8],
          outline: { color: [80,0,200,0.9], width: 2 }
        })
      }),
      popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
    });
    const polygonLayer = new FeatureLayer({
      url: polygonUrl,
      title: title + " (水利小組)",
      visible: true,
      renderer: new SimpleRenderer({
        symbol: new SimpleFillSymbol({
          color: [255,240,150,0.22],
          outline: { color: [255,200,0,0.9], width: 2 }
        })
      }),
      popupTemplate: { title: "{名稱}", content: "面積：{Shape_Area}" }
    });
    return new GroupLayer({
      title: title,
      visibilityMode: "inherited",
      visible: true,
      layers: [polygonLayer, pointLayer],
      listMode: "show"
    });
  }

  // 河水堰復舊（主群組，預設不顯示）
  const riverWeirRestorationGroup = new GroupLayer({
    title: "河水堰復舊",
    visible: false,
    visibilityMode: "independent",
    listMode: "show",
    layers: [
      createWeirSet(
        "員山溪1號",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/42",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/58"
      ),
      createWeirSet(
        "大深坑溪2號",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/41",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/57"
      ),
      createWeirSet(
        "大深坑溪3號",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/40",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/56"
      ),
      createWeirSet(
        "大深坑溪4號",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/39",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/55"
      ),
      createWeirSet(
        "德鴨溪9號",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/38",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/54"
      ),
      createWeirSet(
        "荖溪2號",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/37",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/53"
      ),
      createWeirSet(
        "荖溪3號",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/36",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/52"
      ),
      createWeirSet(
        "德鴨溪8號",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/35",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/51"
      ),
      createWeirSet(
        "德鴨溪7號",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/34",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/50"
      ),
      createWeirSet(
        "北勢溪10號",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/33",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/49"
      ),
      createWeirSet(
        "北勢溪9號",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/32",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/48"
      ),
      createWeirSet(
        "牛鬥溪8號",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/31",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/47"
      )
    ]
  });

  // 湖口工作站
  const hukou = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/hukou_workstation/FeatureServer",
    title: "湖口工作站",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [255,0,0,0.9], width: 4, style: "solid"
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });

  // 土地利用群組
  const landuse_owner = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/landuse/FeatureServer/6",
    title: "所有權人類型",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleFillSymbol({
        color: [255, 200, 0, 0.3],
        outline: { color: [255, 200, 0, 0.9], width: 2 }
      })
    }),
    popupTemplate: { title: "{名稱}", content: "面積：{Shape_Area}" }
  });
  const landuse_water = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/landuse/FeatureServer/7",
    title: "水利用地",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleFillSymbol({
        color: [0, 120, 255, 0.3],
        outline: { color: [0, 120, 255, 0.9], width: 2 }
      })
    }),
    popupTemplate: { title: "{名稱}", content: "面積：{Shape_Area}" }
  });
  const landuse_group = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/landuse/FeatureServer/8",
    title: "水利小組",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleFillSymbol({
        color: [0, 200, 100, 0.3],
        outline: { color: [0, 200, 100, 0.9], width: 2 }
      })
    }),
    popupTemplate: { title: "{名稱}", content: "面積：{Shape_Area}" }
  });
  const landuseGroup = new GroupLayer({
    title: "土地利用",
    visibilityMode: "independent",
    visible: false,
    layers: [landuse_owner, landuse_water, landuse_group]
  });

  // 堤塘_有高程
  const ponds = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/ponds/FeatureServer",
    title: "堤塘_有高程",
    visible: false,
    renderer: new SimpleRenderer({
      symbol: new SimpleFillSymbol({
        color: [180,180,180,0.28],
        outline: { color: [120,120,120,0.9], width: 2 }
      })
    }),
    popupTemplate: { title: "{名稱}", content: "面積：{Shape_Area}" }
  });

  // ====== 新增【圳路群組】======
  const canal_main = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/canal/FeatureServer/4",
    title: "幹線",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [0, 180, 255, 0.85], width: 3, style: "solid"
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const canal_branch = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/canal/FeatureServer/11",
    title: "支線",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [0, 140, 100, 0.85], width: 2.4, style: "solid"
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const canal_sub = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/canal/FeatureServer/20",
    title: "分線",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [130, 80, 220, 0.85], width: 2, style: "solid"
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const canal_intake = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/canal/FeatureServer/21",
    title: "取入",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [230, 80, 80, 0.85], width: 2, style: "dash"
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const canal_drain = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/canal/FeatureServer/22",
    title: "大排中排小排",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [0, 0, 0, 0.85], width: 1.6, style: "dot"
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });

  const canalGroup = new GroupLayer({
    title: "圳路",
    visibilityMode: "independent",
    visible: false,
    layers: [canal_main, canal_branch, canal_sub, canal_intake, canal_drain]
  });

  // 河川相關圖層
  const river_main = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river/FeatureServer/13",
    title: "河川_河道",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [0,120,200,1], width: 2, style: "solid"
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const river_branch = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river/FeatureServer/14",
    title: "河川_支流",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [50,150,80,1], width: 1.5, style: "dot"
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const river_drain = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river/FeatureServer/15",
    title: "區排",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [150,80,0,1], width: 1, style: "dash"
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const riverGroup = new GroupLayer({
    title: "河川相關圖層",
    visibilityMode: "independent",
    visible: false,
    layers: [river_main, river_branch, river_drain]
  });

  // 使用中河水堰群組
  const activeWeir_owner = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/active_river_weirs/FeatureServer/1",
    title: "河水堰_有水權",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleMarkerSymbol({
        style: "circle",
        color: [50,200,255,0.85],
        size: 9,
        outline: { color: [0,100,200,1], width: 2 }
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const activeWeir_active = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/active_river_weirs/FeatureServer/2",
    title: "河水堰_使用中",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleMarkerSymbol({
        style: "cross",
        color: [255,200,50,0.85],
        size: 11,
        outline: { color: [120,80,0,1], width: 2 }
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const activeWeirGroup = new GroupLayer({
    title: "使用中河水堰",
    visibilityMode: "independent",
    visible: false,
    layers: [activeWeir_owner, activeWeir_active]
  });

  // 等高線
  const contours = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/contours_10m/FeatureServer",
    title: "等高線_10公尺間距",
    visible: false,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [120,120,200,1], width: 1, style: "dash"
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });

  // 匯出所有圖層
  return {
    createWeirSet,
    riverWeirRestorationGroup,
    hukou,
    landuse_owner,
    landuse_water,
    landuse_group,
    landuseGroup,
    ponds,
    canal_main,
    canal_branch,
    canal_sub,
    canal_intake,
    canal_drain,
    canalGroup,
    river_main,
    river_branch,
    river_drain,
    riverGroup,
    activeWeir_owner,
    activeWeir_active,
    activeWeirGroup,
    contours
  };
});
