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

  // Helper: 河水堰復舊 點+面小組（修改為不可展開的群組）
  function createWeirSet(title, pointUrl, polygonUrl) {
    const pointLayer = new FeatureLayer({
      url: pointUrl,
      title: title + "河水堰",
      visible: true,
      renderer: new SimpleRenderer({
      symbol: new SimpleMarkerSymbol({
        style: "diamond",
        size: 14,
        color: [180,0,255,0.8],
        outline: { color: [80,0,200,0.9], width: 2 }
      }),
      }),
      popupTemplate: { 
      title: "{河水堰}", 
      content: [{
        type: "fields",
        fieldInfos: [
        { fieldName: "所屬圳路", label: "所屬圳路" },
        { fieldName: "所屬圳路連接小組_1", label: "連接小組-1" },
        { fieldName: "所屬圳路連接小組_2", label: "連接小組-2" },
        { fieldName: "所屬圳路連接小組_3", label: "連接小組-3" },
        { fieldName: "所屬圳路連接小組_4", label: "連接小組-4" },
        { fieldName: "連接小組總面積", label: "連接小組總面積 (公頃)" }
        ]
      }]
      },

      // --- 從這裡開始加入標籤設定 ---
      labelingInfo: [{
      labelExpressionInfo: {
        // 設定要顯示為標籤的欄位，這裡我們用 "名稱" 欄位
        expression: "$feature.河水堰" 
      },
      // 為了在 3D 場景中有最好的效果，建議使用 LabelSymbol3D
      symbol: {
        type: "label-3d", // 指定 Symbol 類型為 3D 標籤
        symbolLayers: [{
        type: "text", // 內層是文字圖層
        material: {
          color: "black" // 文字顏色
        },
        halo: { // 加上黑色光暈 (描邊)，讓白色文字更清晰
          color: "white",
          size: 2
        },
        font: {
          // 關鍵：在這裡設定文字大小，您可以依需求調整數字
          size: 20, 
          weight: "bold",
          family: "Microsoft JhengHei" // 建議指定一個支援中文的字體
        }
        }],
        // 加上引導線，避免文字直接蓋在圖示上
        callout: {
        type: "line",
        size: 1,
        color: [50, 50, 50],
        border: {
          color: [255, 255, 255, 0.7]
        }
        }
      }
      }]
      // --- 標籤設定結束 ---
    
    });
    const polygonLayer = new FeatureLayer({
      url: polygonUrl,
      title: title + "連接水利小組",
      visible: true,
      renderer: new SimpleRenderer({
        symbol: new SimpleFillSymbol({
          color: [255,240,150,0.22],
          outline: { color: [240,170,0,1], width: 2 }
        })
      }),
      popupTemplate: { title: "{名稱}", content: "面積：{Shape_Area}" }
    });
    
    // 返回一個不可展開的群組
    return new GroupLayer({
      title: title,
      visibilityMode: "inherited",
      visible: true,
      layers: [polygonLayer, pointLayer],
      listMode: "hide-children" // 隱藏子圖層
    });
  }

  // 河水堰復舊（主群組，預設不顯示

  const old_1 = new GroupLayer({
    title: "員山溪1號",
    visible: false,
    layers: [
      createWeirSet(
        "",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/42",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/58"
      )]
  })

  const old_2 = new GroupLayer({
    title: "大深坑溪2號",
    visible: false,
    layers: [
      createWeirSet(
        "",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/41",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/57"
      )]
  })

  const old_3 = new GroupLayer({
    title: "大深坑溪3號",
    visible: false,
    layers: [
      createWeirSet(
        "",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/40",
        "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/56"
      )]
  })  

  const old_4 = new GroupLayer({
  title: "大深坑溪4號",
  visible: false,
  layers: [
    createWeirSet(
      "",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/39",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/55"
    )
  ]
});

const old_5 = new GroupLayer({
  title: "德鴨溪9號",
  visible: false,
  layers: [
    createWeirSet(
      "",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/38",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/54"
    )
  ]
});

const old_6 = new GroupLayer({
  title: "荖溪2號",
  visible: false,
  layers: [
    createWeirSet(
      "",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/37",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/53"
    )
  ]
});

const old_7 = new GroupLayer({
  title: "荖溪3號",
  visible: false,
  layers: [
    createWeirSet(
      "",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/36",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/52"
    )
  ]
});

const old_8 = new GroupLayer({
  title: "德鴨溪8號",
  visible: false,
  layers: [
    createWeirSet(
      "",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/35",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/51"
    )
  ]
});

const old_9 = new GroupLayer({
  title: "德鴨溪7號",
  visible: false,
  layers: [
    createWeirSet(
      "",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/34",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/50"
    )
  ]
});

const old_10 = new GroupLayer({
  title: "北勢溪10號",
  visible: false,
  layers: [
    createWeirSet(
      "",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/33",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/49"
    )
  ]
});

const old_11 = new GroupLayer({
  title: "北勢溪9號",
  visible: false,
  layers: [
    createWeirSet(
      "",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/32",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/48"
    )
  ]
});

const old_12 = new GroupLayer({
  title: "牛鬥溪8號",
  visible: false,
  layers: [
    createWeirSet(
      "",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/31",
      "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river_weir_restoration/FeatureServer/47"
    )
  ]
});

const riverWeirRestorationGroup = new GroupLayer({
  title: "河水堰復舊",
  visible: false,
  visibilityMode: "independent",
  listMode: "show",
  layers: [
    old_1, old_2, old_3, old_4, old_5, old_6, old_7, old_8, old_9, old_10, old_11, old_12
  ]
});

  // 湖口工作站
  const hukou = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/hukou_workstation/FeatureServer",
    title: "湖口工作站範圍",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [0,0,0,1], width: 2, style: "solid"
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });

  // 土地利用群組
  const landuse_owner = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/landuse/FeatureServer/6",
    title: "所有權人類型",
    visible: true,
    renderer: {
      type: "unique-value",
      field: "類型",
      uniqueValueInfos: [
        {
          value: "國有",
          symbol: {
            type: "simple-fill",
            color: [29, 79, 96, 1],
            outline: { color: [0, 0, 0, 1], width: 0.1}
          },
          label: "國有"
        },
        {
          value: "私有",
          symbol: {
            type: "simple-fill",
            color: [196, 230, 195, 1],
            outline: { color: [0, 0, 0, 1], width: 0.1}
          },
          label: "私有"
        }
      ]
    }
  });
  const landuse_water = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/landuse/FeatureServer/7",
    title: "水利用地",
    visible: false,
    renderer: new SimpleRenderer({
      symbol: new SimpleFillSymbol({
        color: [0, 77, 168, 1],
        outline: { color: [0, 0, 0, 1], width: 0.1}
      })
    })
  });
  const landuse_group = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/landuse/FeatureServer/8",
    title: "水利小組",
    visible: false,
    renderer: new SimpleRenderer({
      symbol: new SimpleFillSymbol({
        color: [0, 200, 100, 0.3],
        outline: { color: [0, 0, 0, 0.9], width: 2}
      })
    }),
    labelingInfo: [{
      labelExpressionInfo: { expression: "$feature.水利小組名稱" },
      symbol: {
        type: "text",
        color: "black",
        haloColor: "white",
        haloSize: "1.5px",
        font: {
          size: 14,
          weight: "normal"
        }
      },
      labelPlacement: "always-horizontal"
    }]
  });
  const landuseGroup = new GroupLayer({
    title: "土地利用",
    visibilityMode: "exclusive",
    visible: false,
    layers: [landuse_group, landuse_water, landuse_owner]
  });

  // 埤塘_有高程
  const ponds = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/ponds/FeatureServer",
    title: "埤塘",
    visible: false,
    renderer: new SimpleRenderer({
      symbol: new SimpleFillSymbol({
        color: [0,120,200,0.3],
        outline: { color: [120,120,120,0.9], width: 0 }
      })
    }),
    popupTemplate: { title: "{OBJECTID}", content: "高程 (m)：{高程}" }
  });

  // ====== 新增【圳路群組】======
  const canal_main = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/canal/FeatureServer/4",
    title: "幹線",
    visible: true,
    definitionExpression: "OBJECTID NOT IN (8, 3, 2)",
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [230, 0, 0, 0.85],
        width: 6,
        style: "solid",
        marker: {
          style: "arrow",
          placement: "end",
        }
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
        color: [230, 0, 0, 0.85],
        width: 4,
        style: "solid",
        marker: {
          style: "arrow",
          placement: "end"
        }
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
        color: [230, 0, 0, 0.85],
        width: 2,
        style: "solid",
        marker: {
          style: "arrow",
          placement: "end"
        }
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
        color: [230, 0, 0, 0.85],
        width: 1,
        style: "solid",
        marker: {
          style: "arrow",
          placement: "end"
        }
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const canal_drain = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/canal/FeatureServer/22",
    title: "大、中、小排",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [0, 0, 0, 0.85], width: 1, style: "dot"
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });

  const canalGroup = new GroupLayer({
    title: "圳路",
    visibilityMode: "independent",
    visible: false,
    layers: [canal_drain, canal_intake, canal_sub, canal_branch, canal_main]
  });

  // 河川相關圖層
  const river_main = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river/FeatureServer/13",
    title: "河道",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleFillSymbol({
        color: [0,120,200,1],
        outline: { color: [0,120,200,1], width: 2 }
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const river_branch = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/river/FeatureServer/14",
    title: "支流",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleLineSymbol({
        color: [0,120,200,1], width: 2, style: "solid"
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
        color: [0,120,200,1], 
        width: 1.5, 
        style: "dot",
        dotPattern: [1, 5]  // 5 points dash, 5 points gap
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const riverGroup = new GroupLayer({
    title: "河川",
    visibilityMode: "independent",
    visible: false,
    layers: [river_drain, river_branch, river_main]
  });

  // 使用中河水堰群組
  const activeWeir_owner = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/active_river_weirs/FeatureServer/1",
    title: "使用中 (有水權)",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleMarkerSymbol({
        style: "circle",
        color: [50,200,255,0.85],
        size: 15,
        outline: { color: [0,100,200,1], width: 2 }
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const activeWeir_active = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/active_river_weirs/FeatureServer/2",
    title: "使用中",
    visible: true,
    renderer: new SimpleRenderer({
      symbol: new SimpleMarkerSymbol({
        style: "circle",
        color: [255,255,255,0.85],
        size: 15,
        outline: { color: [0,0,0,1], width: 2 }
      })
    }),
    popupTemplate: { title: "{名稱}", content: "OID：{OBJECTID}" }
  });
  const activeWeirGroup = new GroupLayer({
    title: "使用中河水堰",
    visibilityMode: "independent",
    visible: false,
    layers: [activeWeir_active, activeWeir_owner]
  });

  // 等高線
  const contours = new FeatureLayer({
    url: "https://gisportal.triwra.org.tw/server/rest/services/Hosted/contours_10m/FeatureServer",
    title: "等高線 (10公尺)",
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
    activeWeir_active,
    activeWeir_owner,
    activeWeirGroup,
    contours
  };
});