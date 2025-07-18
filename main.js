require([
  "esri/config",
  "esri/Map",
  "esri/views/SceneView",
  "esri/widgets/LayerList",
  "esri/widgets/Legend",
  "esri/widgets/BasemapGallery",
  "esri/widgets/DirectLineMeasurement3D",
  "esri/widgets/AreaMeasurement3D",
  "esri/widgets/Expand",
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
  esriConfig, Map, SceneView, LayerList, Legend, BasemapGallery, DirectLineMeasurement3D, AreaMeasurement3D, Expand, Basemap, Extent, SceneLayer, GroupLayer,
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

  // 建立誇張版 Elevation Layer 子類別
  const ExaggeratedElevationLayer = ElevationLayer.createSubclass({
    properties: {
      exaggeration: 1.0
    },
    initialize: function() {
      this._elevation = new ElevationLayer({ url: this.url });
    },
    fetchTile: function(level, row, col, options) {
      return this._elevation.fetchTile(level, row, col, options).then(data => {
        const exaggeration = this.exaggeration;
        for (let i = 0; i < data.values.length; i++) {
          data.values[i] = data.values[i] * exaggeration;
        }
        return data;
      });
    }
  });

  // 初始地形誇張倍率
  const initialExaggeration = 10;

  // 建立初始的地形圖層
  const initialElevationLayer = new ExaggeratedElevationLayer({
    url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
    exaggeration: initialExaggeration
  });

  // 將地形圖層設定到 Ground
  const ground = new Ground({
    layers: [initialElevationLayer]
  });

  // 建立地圖
  const map = new Map({
    basemap: "gray",
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
      position: { longitude: 120.84, latitude: 25.095, z: 14000},
      tilt: 63.5,
      heading: 140
    },
    environment: {
      background: {
        type: "color",
        color: [25, 25, 25, 1]
      },
      starsEnabled: false,
      atmosphereEnabled: false
    }
  });

  // 載入訊息的輔助函式
  let loadingNode = null;
  function showLoadingMessage(message) {
    if (loadingNode) { return; }
    loadingNode = document.createElement('div');
    loadingNode.className = 'loading-message'; // REFACTORED: Use class
    loadingNode.innerText = message;
    document.body.appendChild(loadingNode);
  }

  function hideLoadingMessage() {
    if (loadingNode) {
      loadingNode.remove();
      loadingNode = null;
    }
  }

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

  // 顯示提示訊息
  function showLayerError(msg, duration = 2000) {
    const node = document.createElement('div');
    node.className = 'layer-error-message'; // REFACTORED: Use class
    node.innerText = msg;
    document.body.appendChild(node);
    setTimeout(() => { node.remove(); }, duration);
  }

  // 建立右側面板
  function createRightSidePanel() {
    const toggleButton = document.createElement("button");
    toggleButton.className = "esri-widget esri-component panel-toggle-button";
    toggleButton.innerHTML = `<img src="icon/layers.svg" width="25" height="25" alt="圖層">`;

    const sidePanel = document.createElement("div");
    sidePanel.className = "esri-widget esri-component right-side-panel";

    const panelHeader = document.createElement("div");
    panelHeader.className = "panel-header";
    const panelTitle = document.createElement("h2");
    panelTitle.textContent = "圖層與底圖控制";
    const closeButton = document.createElement("button");
    closeButton.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    panelHeader.appendChild(panelTitle);
    panelHeader.appendChild(closeButton);
    
    const panelContent = document.createElement("div");
    panelContent.className = "panel-content";

    const layerSection = document.createElement("div");
    layerSection.className = "layer-section";
    const layerTitle = document.createElement("h3");
    layerTitle.textContent = "圖層控制";
    const layerListContainer = document.createElement("div");
    layerListContainer.className = "layer-list-container";
    layerSection.appendChild(layerTitle);
    layerSection.appendChild(layerListContainer);

    const basemapSection = document.createElement("div");
    basemapSection.className = "basemap-section";
    const basemapTitle = document.createElement("h3");
    basemapTitle.textContent = "底圖與地形控制";
    const basemapContainer = document.createElement("div");
    basemapContainer.className = "basemap-selector";
    basemapSection.appendChild(basemapTitle);
    basemapSection.appendChild(basemapContainer);

    const opacityContainer = document.createElement("div");
    opacityContainer.className = "opacity-control";
    const opacityLabel = document.createElement("label");
    opacityLabel.textContent = "底圖透明度";
    const sliderContainer = document.createElement("div");
    sliderContainer.className = "slider-container";
    const basemapSlider = document.createElement("input");
    basemapSlider.type = "range";
    basemapSlider.min = "0";
    basemapSlider.max = "100";
    basemapSlider.value = "100";
    basemapSlider.className = "opacity-slider";
    const valueDisplay = document.createElement("span");
    valueDisplay.className = "slider-value";
    valueDisplay.textContent = "100%";
    sliderContainer.appendChild(basemapSlider);
    sliderContainer.appendChild(valueDisplay);
    opacityContainer.appendChild(opacityLabel);
    opacityContainer.appendChild(sliderContainer);
    basemapSection.appendChild(opacityContainer);

    const terrainControlContainer = document.createElement("div");
    terrainControlContainer.className = "opacity-control";
    const terrainLabel = document.createElement("label");
    terrainLabel.textContent = "地形誇張";
    const terrainSliderContainer = document.createElement("div");
    terrainSliderContainer.className = "slider-container";
    
    const terrainSlider = document.createElement("input");
    terrainSlider.type = "range";
    terrainSlider.min = "1";
    terrainSlider.max = "50";
    terrainSlider.value = initialExaggeration.toString();
    terrainSlider.step = "0.5";
    terrainSlider.className = "opacity-slider";
    
    const terrainValueDisplay = document.createElement("span");
    terrainValueDisplay.className = "slider-value";
    terrainValueDisplay.textContent = `${initialExaggeration}x`;
    
    terrainSliderContainer.appendChild(terrainSlider);
    terrainSliderContainer.appendChild(terrainValueDisplay);
    terrainControlContainer.appendChild(terrainLabel);
    terrainControlContainer.appendChild(terrainSliderContainer);
    basemapSection.appendChild(terrainControlContainer);
    
    panelContent.appendChild(layerSection);
    panelContent.appendChild(basemapSection);
    sidePanel.appendChild(panelHeader);
    sidePanel.appendChild(panelContent);

    document.body.appendChild(toggleButton);
    document.body.appendChild(sidePanel);
    
    // RETAINED: Dynamic style based on value
    basemapSlider.addEventListener("input", function() {
      const opacity = parseFloat(this.value) / 100;
      valueDisplay.textContent = this.value + "%";
      this.style.background = `linear-gradient(to right, #3b82f6 ${this.value}%, #e5e7eb ${this.value}%)`;
      if (map.basemap?.baseLayers.length > 0) {
        map.basemap.baseLayers.forEach(layer => { layer.opacity = opacity; });
      }
    });
    
    // RETAINED: Initial dynamic style
    basemapSlider.style.background = `linear-gradient(to right, #3b82f6 100%, #e5e7eb 100%)`;
    const terrainPercentage = ((initialExaggeration - terrainSlider.min) / (terrainSlider.max - terrainSlider.min)) * 100;
    terrainSlider.style.background = `linear-gradient(to right, #3b82f6 ${terrainPercentage}%, #e5e7eb ${terrainPercentage}%)`;

    let isPanelOpen = true; // 預設為展開
    // REFACTORED: Use classList to toggle state
    const updatePanelUI = () => {
      sidePanel.classList.toggle('is-open', isPanelOpen);
      toggleButton.classList.toggle('is-open', isPanelOpen);
      toggleButton.innerHTML = `<img src="icon/layers.svg" width="25" height="25" alt="圖層">`;
    };
    const togglePanel = () => {
      isPanelOpen = !isPanelOpen;
      updatePanelUI();
    };
    // **初始化呼叫一次讓 panel 展開**
    updatePanelUI();

    toggleButton.addEventListener("click", togglePanel);
    closeButton.addEventListener("click", togglePanel);
    
    return { layerListContainer, basemapContainer, basemapSlider, terrainSlider, terrainValueDisplay };
  }

  // 建立測量工具
  function createMeasurementTools() {
    const distanceMeasurement = new DirectLineMeasurement3D({ view: view });
    const areaMeasurement = new AreaMeasurement3D({ view: view });
    
    const measurementContainer = document.createElement("div");
    measurementContainer.className = "tool-container";

    const measurementPanel = document.createElement("div");
    measurementPanel.className = "esri-widget esri-component tool-panel";

    const distanceButton = document.createElement("button");
    distanceButton.textContent = "距離測量";
    distanceButton.className = "esri-button";

    const areaButton = document.createElement("button");
    areaButton.textContent = "面積測量";
    areaButton.className = "esri-button";

    const clearButton = document.createElement("button");
    clearButton.textContent = "清除測量";
    clearButton.className = "esri-button";

    measurementPanel.appendChild(distanceButton);
    measurementPanel.appendChild(areaButton);
    measurementPanel.appendChild(clearButton);

    const measurementToggle = document.createElement("button");
    measurementToggle.className = "esri-widget esri-component tool-toggle-button";
    measurementToggle.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l18 18"/><path d="M21 3L3 21"/><circle cx="9" cy="9" r="2"/><circle cx="15" cy="15" r="2"/></svg>`;
    measurementToggle.title = "測量工具";

    measurementContainer.appendChild(measurementToggle);
    measurementContainer.appendChild(measurementPanel);

    let activeWidget = null;
    let isPanelOpen = false;

    // REFACTORED: Use classList to toggle state
    function togglePanel() {
        isPanelOpen = !isPanelOpen;
        measurementPanel.classList.toggle('is-active', isPanelOpen);
        measurementToggle.classList.toggle('is-active', isPanelOpen);
    }
    const closeMeasurementPanel = () => {
      isPanelOpen = false;
      measurementPanel.classList.remove('is-active');
      measurementToggle.classList.remove('is-active');
    };

    measurementToggle.addEventListener("click", togglePanel);

    distanceButton.addEventListener("click", () => {
      if (activeWidget) activeWidget.viewModel.clear();
      activeWidget = distanceMeasurement;
      distanceMeasurement.viewModel.start();
      closeMeasurementPanel();
    });
    areaButton.addEventListener("click", () => {
      if (activeWidget) activeWidget.viewModel.clear();
      activeWidget = areaMeasurement;
      areaMeasurement.viewModel.start();
      closeMeasurementPanel();
    });
    clearButton.addEventListener("click", () => {
      distanceMeasurement.viewModel.clear();
      areaMeasurement.viewModel.clear();
      activeWidget = null;
      closeMeasurementPanel();
    });
    return measurementContainer;
  }
  
  // ---------- 全新：重構後的互動式動畫功能 ----------
  function createInteractiveAnimationTools() {
    // --- 狀態管理變數 ---
    let isRecording = false;
    let customWaypoints = [];
    let isAnimationPanelOpen = false;

    // --- 建立 UI 元素 (仿照測量工具的結構) ---
    const animationToolsContainer = document.createElement("div");
    animationToolsContainer.className = "tool-container animation-tools"; // Use shared and specific classes

    const animationToggle = document.createElement("button");
    animationToggle.className = "esri-widget esri-component tool-toggle-button";
    animationToggle.title = "互動式動畫工具";
    animationToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.982 1.566a.5.5 0 0 0-.964 0l-1.5 3A.5.5 0 0 0 3 5h10a.5.5 0 0 0 .482-.434l-1.5-3a.5.5 0 0 0-.964 0l-1.5 3H4.982ZM13.5 6H2.5a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1ZM2 8.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5H2Z"/></svg>`;

    const animationPanel = document.createElement("div");
    animationPanel.className = "esri-widget esri-component tool-panel";
      
    const startButton = document.createElement("button");
    startButton.textContent = "開始錄製";
    startButton.className = "esri-button";

    const addWaypointButton = document.createElement("button");
    addWaypointButton.textContent = "新增航點";
    addWaypointButton.className = "esri-button";

    const stopButton = document.createElement("button");
    stopButton.textContent = "結束錄製";
    stopButton.className = "esri-button";

    const playButton = document.createElement("button");
    playButton.textContent = "播放路徑";
    playButton.className = "esri-button";

    const clearButton = document.createElement("button");
    clearButton.textContent = "清除路徑";
    clearButton.className = "esri-button";
    
    animationPanel.appendChild(startButton);
    animationPanel.appendChild(addWaypointButton);
    animationPanel.appendChild(stopButton);
    animationPanel.appendChild(playButton);
    animationPanel.appendChild(clearButton);

    animationToolsContainer.appendChild(animationToggle);
    animationToolsContainer.appendChild(animationPanel);
      
    // --- 按鈕狀態與互動邏輯 ---
    function updateButtonStates() {
        startButton.disabled = isRecording;
        addWaypointButton.disabled = !isRecording;
        stopButton.disabled = !isRecording;
        playButton.disabled = isRecording || customWaypoints.length < 2;
        clearButton.disabled = isRecording || customWaypoints.length === 0;
    }

    // REFACTORED: Use classList to toggle state
    const closeAnimationPanel = () => {
      isAnimationPanelOpen = false;
      animationPanel.classList.remove('is-active');
      animationToggle.classList.remove('is-active');
    };

    animationToggle.addEventListener("click", () => {
      isAnimationPanelOpen = !isAnimationPanelOpen;
      animationPanel.classList.toggle('is-active', isAnimationPanelOpen);
      animationToggle.classList.toggle('is-active', isAnimationPanelOpen);
    });

    // --- 詳細按鈕的事件監聽 ---
    startButton.addEventListener("click", () => {
        isRecording = true;
        customWaypoints = [];
        updateButtonStates();
        showLayerError("錄製模式已開啟！請移動視角後點擊「新增航點」。");
    });

    addWaypointButton.addEventListener("click", () => {
        if (!isRecording) return;
        const camera = view.camera.clone();
        customWaypoints.push({ camera });
        showLayerError(`已新增航點 ${customWaypoints.length}`);
        updateButtonStates();
    });

    stopButton.addEventListener("click", () => {
        if (!isRecording) return;
        isRecording = false;
        showLayerError(`錄製結束，共 ${customWaypoints.length} 個航點。`);
        updateButtonStates();
        closeAnimationPanel(); // 結束錄製後關閉面板
    });

    clearButton.addEventListener("click", () => {
        isRecording = false;
        customWaypoints = [];
        showLayerError("已清除所有自訂航點。");
        updateButtonStates();
        closeAnimationPanel(); // 清除後關閉面板
    });

    playButton.addEventListener("click", async () => {
        if (customWaypoints.length < 2) {
            showLayerError("路徑至少需要 2 個航點才能播放。");
            return;
        }
        closeAnimationPanel(); // 開始播放時關閉面板
        view.ui.enabled = false;
        showLoadingMessage("正在播放自訂路徑...");

        for (const waypoint of customWaypoints) {
            await view.goTo(waypoint.camera, { speedFactor: 0.5, easing: "linear" });
        }

        hideLoadingMessage();
        view.ui.enabled = true;
    });

    // --- 初始化 ---
    updateButtonStates();
    return animationToolsContainer;
  }

  // ---------- UI組件註冊 ----------
  view.when(() => {
    addAvailableBuildings();
    const rightPanel = createRightSidePanel();

    // 將測量工具加入到左上角位置
    const measurementTools = createMeasurementTools();
    view.ui.add(measurementTools, "top-left");
      
    // 將新的動畫工具加入到左上角位置
    const animationTools = createInteractiveAnimationTools();
    view.ui.add(animationTools, "top-left");

    // 修正地形誇張化的事件監聽器部分
    let terrainUpdateTimeout;
    rightPanel.terrainSlider.addEventListener("input", function() {
      const exaggerationValue = parseFloat(this.value);
      rightPanel.terrainValueDisplay.textContent = `${exaggerationValue.toFixed(1)}x`;
      const percentage = ((exaggerationValue - this.min) / (this.max - this.min)) * 100;
      this.style.background = `linear-gradient(to right, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%)`;

      clearTimeout(terrainUpdateTimeout);
      terrainUpdateTimeout = setTimeout(() => {
        showLoadingMessage("地形調整中，請稍後...");
        
        const newElevationLayer = new ExaggeratedElevationLayer({
          url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
          exaggeration: exaggerationValue
        });
        
        // 移除舊的地形圖層
        map.ground.layers.removeAll();
        map.ground.layers.add(newElevationLayer);

        // 即時同步檢查機制
        const checkAndHideLoading = () => {
          // 檢查視圖是否不再更新中
          if (!view.updating) {
            hideLoadingMessage();
            return;
          }
          
          // 立即再次檢查（使用requestAnimationFrame保持同步）
          requestAnimationFrame(checkAndHideLoading);
        };
        
        // 立即開始檢查
        requestAnimationFrame(checkAndHideLoading);
        
        // 安全退出機制：1秒後強制隱藏
        setTimeout(() => {
          hideLoadingMessage();
        }, 1000);
        
      }, 400);
    });


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
    
    new BasemapGallery({
      view,
      container: rightPanel.basemapContainer,
      source: [Basemap.fromId("osm"), Basemap.fromId("satellite"), Basemap.fromId("gray")]
    });
    
    // 建立圖例
    const legend = new Legend({
      view,
      layerInfos: map.layers
        .filter(layer => layer.title !== "建物圖層")
        .map(layer => ({ layer }))
    });
    
    // 將圖例加入到左下角位置
    view.ui.add(legend, "bottom-left");
    
    // 設定圖例和測量工具的z-index層級
    view.when(() => {
      // 設定圖例較低的z-index
      const legendElement = legend.container;
      if (legendElement) {
        legendElement.style.zIndex = "1";
        legendElement.classList.add("legend-container");
      }
      
      // 確保測量工具有更高的z-index
      const measurementToolElements = document.querySelectorAll('.tool-container');
      measurementToolElements.forEach(element => {
        element.style.zIndex = "999";
      });
      
      // 也確保測量工具面板有正確的z-index
      const toolPanels = document.querySelectorAll('.tool-panel');
      toolPanels.forEach(panel => {
        panel.style.zIndex = "1000";
      });
    });
    
    map.watch("basemap", (newBasemap) => {
      const currentOpacity = parseFloat(rightPanel.basemapSlider.value) / 100;
      if (newBasemap?.baseLayers.length > 0) {
        newBasemap.baseLayers.forEach(layer => { layer.opacity = currentOpacity; });
      }
    });
  });
});