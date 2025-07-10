// main.js (已移除所有 CSS 的版本)
require([
  "esri/config",
  "esri/Map",
  "esri/views/SceneView",
  "esri/widgets/LayerList",
  "esri/widgets/Legend",
  "esri/widgets/BasemapGallery",
  "esri/Basemap",
  "esri/geometry/Extent",
  "esri/layers/SceneLayer",
  "esri/layers/GroupLayer",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/MeshSymbol3D",
  "esri/symbols/FillSymbol3DLayer",
  "./layers.js",
  "esri/layers/ElevationLayer",
  "esri/Ground"
], function(
  esriConfig, Map, SceneView, LayerList, Legend, BasemapGallery, Basemap, Extent, SceneLayer, GroupLayer,
  SimpleRenderer, MeshSymbol3D, FillSymbol3DLayer, layers, ElevationLayer, Ground
) {
  // CORS 設定
  if (esriConfig.request?.corsEnabledServers?.add) {
    esriConfig.request.corsEnabledServers.add("gisportal.triwra.org.tw");
    esriConfig.request.corsEnabledServers.add("i3s.nlsc.gov.tw");
  }

  // 建物 3D 符號渲染器
  const buildingsRenderer = new SimpleRenderer({
    symbol: new MeshSymbol3D({
      symbolLayers: [
        new FillSymbol3DLayer({
          material: { color: [255, 255, 255, 0.1] },
          edges: { type: "solid", color: [50, 50, 50, 0.5], size: 1 }
        })
      ]
    })
  });

  // 空的建物群組
  const buildingLayerGroup = new GroupLayer({
    title: "建物圖層",
    layers: [],
    visible: true
  });

  // 1. 建立誇張版 Elevation Layer
  const ExaggeratedElevationLayer = ElevationLayer.createSubclass({
    properties: {
      exaggeration: 10
    },
    initialize: function() {
      this._elevation = new ElevationLayer({ url: this.url });
    },
    fetchTile: function(level, row, col, options) {
      // 用 this._elevation（不是 _originalElevation）
      return this._elevation.fetchTile(level, row, col, options).then(data => {
        for (let i = 0; i < data.values.length; i++) {
          data.values[i] = data.values[i] * this.exaggeration;
        }
        return data;
      });
    }
  });

  // 2. 實體化一個高程來源
  const elevationLayer = new ExaggeratedElevationLayer({
    url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
    exaggeration: 10 // 改你要的倍率
  });

  // 3. ground 設為這個 elevationLayer
  const ground = new Ground({
    layers: [elevationLayer]
  });

  // 建立地圖
  const map = new Map({
    basemap: "osm",
    ground: ground,
    layers: [
      buildingLayerGroup, layers.hukou, layers.contours, layers.landuseGroup, layers.canalGroup,
      layers.riverGroup, layers.ponds, layers.activeWeirGroup, layers.riverWeirRestorationGroup
    ]
  });

  // 3D SceneView
  const view = new SceneView({
    container: "viewDiv",
    map,
    viewingMode: "local",
    clippingArea: new Extent({
      xmin: 120.95, ymin: 24.8725, xmax: 121.117, ymax: 24.9825,
      spatialReference: { wkid: 4326 }
    }),
    camera: {
      position: { longitude: 121.05, latitude: 24.9, z: 3500 },
      tilt: 65
    },
    // 這一段就是重點
    environment: {
      background: {
        type: "color",  // 這句一定要有！
        color: [0, 0, 0, 1] // 這裡設成全白，想換灰色就改RGB
      },
      starsEnabled: false,    // 不顯示星星
      atmosphereEnabled: false // 不顯示大氣
    }
  });

  // 異步載入建物圖層
  async function addAvailableBuildings() {
    const buildingConfigs = [
      { url: "https://i3s.nlsc.gov.tw/building/i3s/SceneServer/layers/9", title: "新竹建物" },
      { url: "https://i3s.nlsc.gov.tw/building/i3s/SceneServer/layers/7", title: "桃園建物" }
    ];
    for (const config of buildingConfigs) {
      const layer = new SceneLayer({ ...config, renderer: buildingsRenderer });
      try {
        await layer.load();
        buildingLayerGroup.add(layer);
      } catch (err) {
        console.warn(`${config.title} 載入失敗`, err);
        showLayerError(`${config.title} 載入失敗`);
      }
    }
  }

  // 顯示失敗訊息
  function showLayerError(msg) {
    const node = document.createElement('div');
    node.innerText = msg;
    // 這些樣式因為是動態錯誤訊息，保留在 JS 中是合理的
    node.style = "position:fixed;top:16px;right:16px;background:#ffefef;color:#aa2222;padding:8px 20px;border-radius:8px;z-index:9999;font-size:14px;";
    document.body.appendChild(node);
    setTimeout(() => { node.remove(); }, 4000);
  }

  // 建立右側面板
  function createRightSidePanel() {
    // 觸發按鈕
    const toggleButton = document.createElement("button");
    toggleButton.className = "esri-widget esri-component panel-toggle-button";
    toggleButton.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`;

    // 右側面板
    const sidePanel = document.createElement("div");
    sidePanel.className = "esri-widget esri-component right-side-panel";

    // 面板標題
    const panelHeader = document.createElement("div");
    panelHeader.className = "panel-header";
    const panelTitle = document.createElement("h2");
    panelTitle.textContent = "圖層與底圖控制";
    const closeButton = document.createElement("button");
    closeButton.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    panelHeader.appendChild(panelTitle);
    panelHeader.appendChild(closeButton);

    // 面板內容
    const panelContent = document.createElement("div");
    panelContent.className = "panel-content";

    // 圖層列表區塊
    const layerSection = document.createElement("div");
    layerSection.className = "layer-section";
    const layerTitle = document.createElement("h3");
    layerTitle.textContent = "圖層控制";
    const layerListContainer = document.createElement("div");
    layerListContainer.className = "layer-list-container";
    layerSection.appendChild(layerTitle);
    layerSection.appendChild(layerListContainer);

    // 底圖區塊
    const basemapSection = document.createElement("div");
    basemapSection.className = "basemap-section";
    const basemapTitle = document.createElement("h3");
    basemapTitle.textContent = "底圖控制";
    const basemapContainer = document.createElement("div");
    basemapContainer.className = "basemap-selector";
    basemapSection.appendChild(basemapTitle);
    basemapSection.appendChild(basemapContainer);

    // 透明度控制區塊
    const opacityContainer = document.createElement("div");
    opacityContainer.className = "opacity-control";
    const opacityLabel = document.createElement("label");
    opacityLabel.textContent = "底圖透明度";
    const sliderContainer = document.createElement("div");
    sliderContainer.className = "slider-container";
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = "100";
    slider.className = "opacity-slider"; // 使用 class
    const valueDisplay = document.createElement("span");
    valueDisplay.className = "slider-value";
    valueDisplay.textContent = "100%";
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);
    opacityContainer.appendChild(opacityLabel);
    opacityContainer.appendChild(sliderContainer);
    basemapSection.appendChild(opacityContainer);

    // 組裝所有元素
    panelContent.appendChild(layerSection);
    panelContent.appendChild(basemapSection);
    sidePanel.appendChild(panelHeader);
    sidePanel.appendChild(panelContent);

    // 添加到頁面
    document.body.appendChild(toggleButton);
    document.body.appendChild(sidePanel);

    // --- 事件處理 ---
    slider.addEventListener("input", function() {
      const opacity = parseFloat(this.value) / 100;
      valueDisplay.textContent = this.value + "%";
      // 更新滑桿背景漸變
      this.style.background = `linear-gradient(to right, #3b82f6 ${this.value}%, #e5e7eb ${this.value}%)`;
      if (map.basemap?.baseLayers.length > 0) {
        map.basemap.baseLayers.forEach(layer => { layer.opacity = opacity; });
      }
    });

    // 面板開關邏輯
    let isPanelOpen = false;
    const togglePanel = () => {
      isPanelOpen = !isPanelOpen;
      sidePanel.style.right = isPanelOpen ? "0" : "-420px";
      toggleButton.style.right = isPanelOpen ? "420px" : "20px";
      toggleButton.style.background = isPanelOpen ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.95)";
      toggleButton.style.color = isPanelOpen ? "#374151" : "#374151";
      toggleButton.innerHTML = isPanelOpen
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`;
    };

    toggleButton.addEventListener("click", togglePanel);
    closeButton.addEventListener("click", togglePanel);

    return { layerListContainer, basemapContainer, slider };
  }

  // ---------- UI組件註冊 ----------
  view.when(() => {

    addAvailableBuildings();

    // 建立右側面板
    const rightPanel = createRightSidePanel();

    // 圖層列表
    new LayerList({
      view,
      container: rightPanel.layerListContainer,
      listItemCreatedFunction: function(event) {
        const item = event.item;
        item.actionsSections = [];
        const title = item.title;
        if (title === "新竹建物" || title === "桃園建物" || title.includes("(點)") || title.includes("(面)")) {
          item.hidden = true;
        }
        if (title === "建物圖層" || title.includes("溪")) {
          item.open = false;
          if (title.includes("溪")) {
             item.canToggle = false;
          }
        }
      }
    });

    // 底圖控制
    new BasemapGallery({
      view,
      container: rightPanel.basemapContainer,
      source: [Basemap.fromId("osm"), Basemap.fromId("satellite"), Basemap.fromId("gray")]
    });

    // 保留圖例在左下角
    // 只顯示非「建物圖層」的圖例
    const legend = new Legend({
      view,
      layerInfos: map.layers
      .filter(layer => layer.title !== "建物圖層")
      .map(layer => ({ layer }))
    });
    view.ui.add(legend, "bottom-left");

    // 底圖變更時保持透明度
    map.watch("basemap", (newBasemap) => {
      const currentOpacity = parseFloat(rightPanel.slider.value) / 100;
      if (newBasemap?.baseLayers.length > 0) {
        newBasemap.baseLayers.forEach(layer => { layer.opacity = currentOpacity; });
      }
    });
    
    // 不再需要動態注入 <style> 標籤
  });
});