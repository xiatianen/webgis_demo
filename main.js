require([
  "esri/config",
  "esri/Map",
  "esri/views/SceneView",
  "esri/widgets/LayerList",
  "esri/widgets/Legend",
  "esri/widgets/BasemapGallery",
  "esri/layers/ElevationLayer",
  "esri/Basemap",
  "esri/geometry/Extent",
  "esri/layers/SceneLayer",
  "esri/layers/GroupLayer",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/MeshSymbol3D",
  "esri/symbols/FillSymbol3DLayer",
  "./layers.js"
], function(
  esriConfig, Map, SceneView, LayerList, Legend, BasemapGallery, ElevationLayer, Basemap, Extent, SceneLayer, GroupLayer,
  SimpleRenderer, MeshSymbol3D, FillSymbol3DLayer, layers
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

  // 建立地圖
  const map = new Map({
    basemap: "osm",
    ground: "world-elevation",
    layers: [
      buildingLayerGroup,
      layers.hukou,
      layers.contours,
      layers.landuseGroup,
      layers.canalGroup,
      layers.riverGroup,
      layers.ponds,
      layers.activeWeirGroup,
      layers.riverWeirRestorationGroup
    ]
  });

  // 湖口裁剪區域
  const clippingExtent = new Extent({
    xmin: 120.95,
    ymin: 24.8725,
    xmax: 121.117,
    ymax: 24.9825,
    spatialReference: { wkid: 4326 }
  });

  // 3D SceneView
  const view = new SceneView({
    container: "viewDiv",
    map,
    viewingMode: "local",
    clippingArea: clippingExtent,
    camera: {
      position: { longitude: 121.05, latitude: 24.9, z: 3500 },
      tilt: 65
    }
  });

  // --------- 重點：只加載成功的建物 SceneLayer ---------------
  async function addAvailableBuildings() {
    const buildingConfigs = [
      {
        url: "https://i3s.nlsc.gov.tw/building/i3s/SceneServer/layers/9",
        title: "新竹建物"
      },
      {
        url: "https://i3s.nlsc.gov.tw/building/i3s/SceneServer/layers/7",
        title: "桃園建物"
      }
    ];
    for (const config of buildingConfigs) {
      const layer = new SceneLayer({
        url: config.url,
        title: config.title,
        renderer: buildingsRenderer
      });
      try {
        await layer.load();
        buildingLayerGroup.add(layer); // 只加載成功的
      } catch (err) {
        console.warn(config.title + " 載入失敗", err);
        showLayerError(config.title + " 載入失敗");
      }
    }
  }

  // 顯示失敗訊息（可選）
  function showLayerError(msg) {
    const node = document.createElement('div');
    node.innerText = msg;
    node.style = "position:fixed;top:16px;right:16px;background:#ffefef;color:#aa2222;padding:8px 20px;border-radius:8px;z-index:9999;font-size:14px;";
    document.body.appendChild(node);
    setTimeout(() => { node.remove(); }, 4000);
  }

  // --------- 建立右側面板式控制介面 ---------------
  function createRightSidePanel() {
    // 觸發按鈕 - 改為更簡潔的設計
    const toggleButton = document.createElement("button");
    toggleButton.className = "esri-widget esri-component panel-toggle-button";
    toggleButton.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    `;
    toggleButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      padding: 10px;
      border: none;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 16px;
      color: #374151;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // 右側面板 - 全新設計
    const sidePanel = document.createElement("div");
    sidePanel.className = "esri-widget esri-component right-side-panel";
    sidePanel.style.cssText = `
      position: fixed;
      top: 0;
      right: -420px;
      width: 400px;
      height: 100vh;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-left: 1px solid rgba(229, 231, 235, 0.8);
      z-index: 999;
      transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      display: flex;
      flex-direction: column;
    `;

    // 面板標題區域 - 改為ArcGIS配色
    const panelHeader = document.createElement("div");
    panelHeader.className = "panel-header";
    panelHeader.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 28px 20px;
      background: #323232;
      color: #f8f8f8;
      border-bottom: 1px solid #404040;
    `;

    const panelTitle = document.createElement("h2");
    panelTitle.textContent = "圖層與底圖控制";
    panelTitle.style.cssText = `
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #f8f8f8;
    `;

    const closeButton = document.createElement("button");
    closeButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeButton.style.cssText = `
      background: transparent;
      border: 1px solid #6e6e6e;
      border-radius: 2px;
      padding: 8px;
      cursor: pointer;
      color: #f8f8f8;
      transition: all 0.2s ease;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    panelHeader.appendChild(panelTitle);
    panelHeader.appendChild(closeButton);

    // 面板內容區域
    const panelContent = document.createElement("div");
    panelContent.className = "panel-content";
    panelContent.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding: 0;
      background: rgba(249, 250, 251, 0.8);
    `;

    // 圖層控制區域
    const layerSection = document.createElement("div");
    layerSection.className = "layer-section";
    layerSection.style.cssText = `
      margin: 24px 28px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
    `;


    const layerTitle = document.createElement("h3");
    layerTitle.textContent = "圖層控制";
    layerTitle.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      padding: 20px 24px 16px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-bottom: 1px solid #e5e7eb;
    `;

    const layerListContainer = document.createElement("div");
    layerListContainer.className = "layer-list-container";
    layerListContainer.style.cssText = `
      max-height: unset;
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      background: white;
    `;

    // 底圖控制區域
    const basemapSection = document.createElement("div");
    basemapSection.className = "basemap-section";
    basemapSection.style.cssText = `
      margin: 24px 28px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      margin-top: auto;
      flex-shrink: 0;
    `;

    const basemapTitle = document.createElement("h3");
    basemapTitle.textContent = "底圖控制";
    basemapTitle.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      padding: 20px 24px 16px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-bottom: 1px solid #e5e7eb;
    `;

    const basemapContainer = document.createElement("div");
    basemapContainer.className = "basemap-selector";
    basemapContainer.style.cssText = `
      padding: 20px 24px;
      background: white;
    `;

    // 透明度控制
    const opacityContainer = document.createElement("div");
    opacityContainer.className = "opacity-control";
    opacityContainer.style.cssText = `
      padding: 20px 24px;
      background: white;
      border-top: 1px solid #f3f4f6;
    `;

    const opacityLabel = document.createElement("label");
    opacityLabel.textContent = "底圖透明度";
    opacityLabel.style.cssText = `
      display: block;
      margin-bottom: 16px;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    `;

    const sliderContainer = document.createElement("div");
    sliderContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 16px;
      background: #f8fafc;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    `;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = "100";
    slider.style.cssText = `
      flex: 1;
      cursor: pointer;
      height: 6px;
      background: linear-gradient(to right, #e5e7eb 0%, #3b82f6 100%);
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
    `;

    const valueDisplay = document.createElement("span");
    valueDisplay.textContent = "100%";
    valueDisplay.style.cssText = `
      color: #6b7280;
      font-size: 13px;
      font-weight: 600;
      min-width: 48px;
      text-align: center;
      background: #3b82f6;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
    `;

    // 透明度控制事件
    slider.addEventListener("input", function() {
      const opacity = parseFloat(this.value) / 100;
      valueDisplay.textContent = this.value + "%";
      
      // 更新滑桿背景漸變
      const percentage = this.value;
      this.style.background = `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
      
      if (map.basemap && map.basemap.baseLayers && map.basemap.baseLayers.length > 0) {
        map.basemap.baseLayers.forEach(layer => {
          layer.opacity = opacity;
        });
      }
    });

    // 面板開關狀態
    let isPanelOpen = false;
    
    function togglePanel() {
      isPanelOpen = !isPanelOpen;
      if (isPanelOpen) {
        sidePanel.style.right = "0";
        toggleButton.style.right = "420px";
        toggleButton.style.background = "rgba(59, 130, 246, 0.9)";
        toggleButton.style.color = "white";
        toggleButton.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        `;
      } else {
        sidePanel.style.right = "-420px";
        toggleButton.style.right = "20px";
        toggleButton.style.background = "rgba(255, 255, 255, 0.95)";
        toggleButton.style.color = "#374151";
        toggleButton.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        `;
      }
    }

    // 事件監聽
    toggleButton.addEventListener("click", togglePanel);
    closeButton.addEventListener("click", togglePanel);

    // 點擊面板外部關閉
    document.addEventListener("click", function(event) {
      if (isPanelOpen && !sidePanel.contains(event.target) && !toggleButton.contains(event.target)) {
        togglePanel();
      }
    });

    // 組裝元素
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);
    opacityContainer.appendChild(opacityLabel);
    opacityContainer.appendChild(sliderContainer);

    layerSection.appendChild(layerTitle);
    layerSection.appendChild(layerListContainer);

    basemapSection.appendChild(basemapTitle);
    basemapSection.appendChild(basemapContainer);
    basemapSection.appendChild(opacityContainer);

    panelContent.appendChild(layerSection);
    panelContent.appendChild(basemapSection);

    sidePanel.appendChild(panelHeader);
    sidePanel.appendChild(panelContent);

    // 添加到頁面
    document.body.appendChild(toggleButton);
    document.body.appendChild(sidePanel);

    return { layerListContainer, basemapContainer, slider };
  }

  // ---------- UI組件註冊 ----------------
  view.when(() => {
    // 啟動建物層異步加載
    addAvailableBuildings();

    // 建立右側面板
    const rightPanel = createRightSidePanel();
    
    // 圖層列表
    const layerList = new LayerList({
      view,
      container: rightPanel.layerListContainer,
      listItemCreatedFunction: function(event){
        event.item.actionsSections = [];
        if (event.item.title === "新竹建物" || event.item.title === "桃園建物") {
          event.item.hidden = true;
        }
        if (event.item.title === "建物圖層") {
          event.item.open = false;
          event.item.canToggle = false;
        }
        if (event.item.title && (
          event.item.title.includes("(點)") ||
          event.item.title.includes("(面)")
        )) {
          event.item.hidden = true;
        }
        if (event.item.title && (
          event.item.title.includes("員山溪") ||
          event.item.title.includes("大深坑溪") ||
          event.item.title.includes("德鴨溪") ||
          event.item.title.includes("荖溪") ||
          event.item.title.includes("北勢溪") ||
          event.item.title.includes("牛鬥溪")
        )) {
          event.item.open = false;
          event.item.canToggle = false;
        }
      }
    });

    // 底圖控制
    const basemapGallery = new BasemapGallery({
      view: view,
      container: rightPanel.basemapContainer,
      source: [
        Basemap.fromId("osm"),
        Basemap.fromId("satellite")
      ]
    });

    // 保留圖例在左下角
    view.ui.add(new Legend({ view: view }), "bottom-left");

    // 底圖變更時保持透明度
    map.watch("basemap", function(newBasemap) {
      const currentOpacity = parseFloat(rightPanel.slider.value) / 100;
      if (newBasemap && newBasemap.baseLayers && newBasemap.baseLayers.length > 0) {
        newBasemap.baseLayers.forEach(layer => {
          layer.opacity = currentOpacity;
        });
      }
    });

    // CSS 樣式
    const style = document.createElement("style");
    style.textContent = `
      .panel-toggle-button:hover {
        transform: translateX(-3px) scale(1.05);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
      }
      
      .right-side-panel .panel-header button:hover {
        background: #404040 !important;
        border-color: #6e6e6e !important;
      }
      
      .right-side-panel .basemap-selector .esri-basemap-gallery__item-container {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 12px !important;
      }
      
      .right-side-panel .basemap-selector .esri-basemap-gallery__item {
        margin: 0 !important;
        border-radius: 12px !important;
        overflow: hidden !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      }
      
      .right-side-panel .basemap-selector .esri-basemap-gallery__item:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
      }
      
      .right-side-panel input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        transition: all 0.2s ease;
        border: 2px solid white;
      }
      
      .right-side-panel input[type="range"]::-webkit-slider-thumb:hover {
        background: #2563eb;
        transform: scale(1.2);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }
      
      .right-side-panel input[type="range"]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      }
      
      .right-side-panel .layer-list-container .esri-layer-list {
        background: transparent;
        overflow-x: hidden; /* 
      }
      
      .right-side-panel .layer-list-container .esri-layer-list:hover {
        overflow-x: hidden !important;
      }

      .right-side-panel .layer-list-container .esri-layer-list__item {
        border-bottom: 1px solid #f3f4f6;
        padding: 12px 24px;
        transition: all 0.2s ease;
        position: relative;
      }
      
      .right-side-panel .layer-list-container .esri-layer-list__item:last-child {
        border-bottom: none;
      }
      
      .right-side-panel .layer-list-container .esri-layer-list__item:hover {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        transform: translateX(4px);
      }
      
      .right-side-panel .layer-list-container .esri-layer-list__item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 4px;
        background: #3b82f6;
        transform: scaleY(0);
        transition: transform 0.2s ease;
      }
      
      .right-side-panel .layer-list-container .esri-layer-list__item:hover::before {
        transform: scaleY(1);
      }
      
      .right-side-panel::-webkit-scrollbar {
        width: 6px;
      }
      
      .right-side-panel::-webkit-scrollbar-track {
        background: rgba(243, 244, 246, 0.5);
      }
      
      .right-side-panel::-webkit-scrollbar-thumb {
        background: rgba(156, 163, 175, 0.6);
        border-radius: 3px;
      }
      
      .right-side-panel::-webkit-scrollbar-thumb:hover {
        background: rgba(107, 114, 128, 0.8);
      }
      
      .layer-list-container::-webkit-scrollbar {
        width: 4px;
      }
      
      .layer-list-container::-webkit-scrollbar-track {
        background: #f8fafc;
      }
      
      .layer-list-container::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 2px;
      }
      
      .layer-list-container::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      
      /* 添加進入動畫 */
      .right-side-panel.entering {
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      /* 卡片懸停效果 */
      .layer-section, .basemap-section {
        transition: all 0.3s ease;
      }
      
      .layer-section:hover, .basemap-section:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
      }
    `;
    document.head.appendChild(style);
  });
});