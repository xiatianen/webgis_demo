require([
  "esri/config",
  "esri/Map",
  "esri/views/SceneView",
  "esri/widgets/LayerList",
  "esri/widgets/Legend",
  "esri/widgets/BasemapGallery",
  "esri/Basemap",
  "./layers.js"
], function(
  esriConfig, Map, SceneView, LayerList, Legend, BasemapGallery, Basemap, layers
) {
  // 加 CORS 設定（必要時）
  if (esriConfig.request?.corsEnabledServers?.add) {
    esriConfig.request.corsEnabledServers.add("gisportal.triwra.org.tw");
  }

  // 建立地圖
  const map = new Map({
    basemap: "osm",
    ground: "world-elevation",
    layers: [
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

  // 建立 3D SceneView
  const view = new SceneView({
    container: "viewDiv",
    map,
    camera: {
      position: { longitude: 121.05, latitude: 24.9, z: 3500 },
      tilt: 65
    }
  });

  // BasemapGallery：只保留 OSM + ESRI 影像
  const basemapGallery = new BasemapGallery({
    view: view,
    source: [
      Basemap.fromId("osm"),
      Basemap.fromId("satellite")
    ]
  });
  view.ui.add(basemapGallery, "bottom-right");

  // LayerList（圖層控制）
  view.ui.add(new LayerList({
    view,
    listItemCreatedFunction: function(event){
      event.item.actionsSections = [];
    }
  }), "top-right");

  // Legend（圖例）
  view.ui.add(new Legend({ view: view }), "bottom-left");

});
