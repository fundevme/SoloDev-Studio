/* ==========================================================================
   LEARN — Guide 2: Making Unity 6 games run fast
   Plain-language rewrite. The eight scripts are unchanged.
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;
  App.guides = App.guides || {};

  App.guides.rendering = {
    id: 'rendering',
    label: 'Making it run fast',
    title: 'Making your Unity 6 game run fast',
    tag: 'Performance · Shaders · Steam Deck',
    deck: 'A beginner-friendly guide to making stylised 3D games run at a smooth 60 FPS in Unity 6. Change a few settings first — that is most of the work — then drop in eight small scripts for the rest.',
    sections: [
      {
        id: 'rn-philosophy',
        title: 'Fix the cause, not the symptom',
        blocks: [
          { t: 'p', x: 'Modern engines encourage a bad habit: throw in too much geometry, light everything dynamically, and then blur the result with heavy anti-aliasing and an upscaler to make it run. For a stylised game, doing the opposite is faster **and** looks better:' },
          { t: 'ascii', x: 'MESSY:   too much geometry ► 50 live lights ► blurry anti-aliasing ► upscaler ► 35 FPS and soft\nCLEAN:   trim the meshes    ► clustered lights ► crisp SMAA         ► no upscaler ► 90 FPS and sharp' },
          { t: 'p', x: 'Get the discipline right once, at the settings level, and your games will run at a sharp 60–90 FPS on handheld hardware.' }
        ]
      },
      {
        id: 'rn-settings',
        title: 'Six settings that do most of the work (no code)',
        blocks: [
          { t: 'h', x: '1. Use Forward+ rendering' },
          { t: 'p', x: 'Open `UniversalRendererData.asset` and set Rendering Path to **Forward+**. It sorts scene lights into screen tiles, so you can have lots of lights without paying the memory cost of deferred rendering.' },
          { t: 'h', x: '2. Use SMAA, not TAA' },
          { t: 'p', x: 'TAA reuses pixels from earlier frames. On art with outlines that produces **ghosting** (trails behind moving lines), **smearing textures** and costs 10–15% of your frame time. Set the camera anti-aliasing to **SMAA (High)** — outlines stay sharp and there is no ghosting at all.' },
          { t: 'h', x: '3. Use Neutral tonemapping, not ACES' },
          { t: 'p', x: 'ACES was made for film. It crushes shadows and turns stylised skin orange. On your Global Volume, set Tonemapping to **Neutral** so bright colours stay bright and highlights fade naturally.' },
          { t: 'h', x: '4. Shadows — the number one performance killer' },
          { t: 'table', head: ['Setting', 'Unity default', 'What to use', 'What it saves'], rows: [
            ['Max distance', '150 m', '35–45 m', 'about 60% of shadow work'],
            ['Cascades', '4', '2', 'halves the shadow draw calls'],
            ['Main light resolution', '4096', '2048', 'frees about 75% of shadow memory bandwidth']
          ] },
          { t: 'h', x: '5. Turn on the SRP Batcher' },
          { t: 'p', x: 'Enable **SRP Batcher** on the URP Asset. Material settings stay in GPU memory, so hundreds of modular environment pieces and character parts draw with almost no CPU overhead.' },
          { t: 'h', x: '6. Bake occlusion culling — it takes three clicks' },
          { t: 'p', x: 'The fastest polygon is the one you never draw. Mark walls, rocks and floors as **Occluder + Occludee Static**, then go to `Window → Rendering → Occlusion Culling → Bake`.' }
        ]
      },
      {
        id: 'rn-scripts',
        title: 'Eight scripts you can paste straight in',
        blocks: [
          { t: 'p', x: 'For the things a checkbox cannot do. Copy each one into `Assets/Scripts/Optimization/`.' },
          { t: 'code', title: '1. SimpleLightCuller.cs', code: 'using UnityEngine;\n\n[RequireComponent(typeof(Light))]\npublic class SimpleLightCuller : MonoBehaviour\n{\n    [Header("Settings")]\n    [Tooltip("How close the player needs to be for this light to turn on.")]\n    public float activationDistance = 25f;\n\n    [Tooltip("Check distance every X seconds (saves CPU power).")]\n    public float checkInterval = 0.25f;\n\n    private Light targetLight;\n    private Transform playerTransform;\n    private float timer;\n\n    void Start()\n    {\n        targetLight = GetComponent<Light>();\n        if (Camera.main != null) playerTransform = Camera.main.transform;\n    }\n\n    void Update()\n    {\n        if (playerTransform == null) return;\n        timer += Time.deltaTime;\n\n        if (timer >= checkInterval)\n        {\n            timer = 0f;\n            float dSq = (transform.position - playerTransform.position).sqrMagnitude;\n            bool on = dSq <= (activationDistance * activationDistance);\n            if (targetLight.enabled != on) targetLight.enabled = on;\n        }\n    }\n}' },
          { t: 'code', title: '2. DynamicShadowTrigger.cs', code: 'using UnityEngine;\nusing UnityEngine.Rendering.Universal;\n\npublic class DynamicShadowTrigger : MonoBehaviour\n{\n    [Header("Shadow Distances")]\n    public float indoorShadowDistance = 15f;\n    public float outdoorShadowDistance = 40f;\n\n    [Header("URP Asset Reference")]\n    public UniversalRenderPipelineAsset urpAsset;\n\n    private void OnTriggerEnter(Collider other)\n    {\n        if (other.CompareTag("Player") && urpAsset != null)\n            urpAsset.shadowDistance = indoorShadowDistance;\n    }\n\n    private void OnTriggerExit(Collider other)\n    {\n        if (other.CompareTag("Player") && urpAsset != null)\n            urpAsset.shadowDistance = outdoorShadowDistance;\n    }\n}' },
          { t: 'code', title: '3. SimpleDynamicResolution.cs', code: 'using UnityEngine;\nusing UnityEngine.Rendering.Universal;\n\npublic class SimpleDynamicResolution : MonoBehaviour\n{\n    [Header("URP Asset")]\n    public UniversalRenderPipelineAsset urpAsset;\n\n    [Header("Framerate Targets")]\n    public float targetFrameRate = 60f;\n    public float dropThreshold = 54f;\n\n    [Header("Resolution Limits")]\n    public float maxRenderScale = 1.0f;\n    public float minRenderScale = 0.80f;\n\n    private float currentScale = 1.0f;\n    private float checkTimer = 0f;\n\n    void Start()\n    {\n        if (urpAsset != null)\n        {\n            currentScale = maxRenderScale;\n            urpAsset.renderScale = currentScale;\n        }\n    }\n\n    void Update()\n    {\n        if (urpAsset == null) return;\n        checkTimer += Time.unscaledDeltaTime;\n\n        if (checkTimer >= 0.5f)\n        {\n            checkTimer = 0f;\n            float fps = 1.0f / Time.unscaledDeltaTime;\n\n            if (fps < dropThreshold && currentScale > minRenderScale)\n            {\n                currentScale = Mathf.Max(minRenderScale, currentScale - 0.05f);\n                urpAsset.renderScale = currentScale;\n            }\n            else if (fps >= (targetFrameRate - 2f) && currentScale < maxRenderScale)\n            {\n                currentScale = Mathf.Min(maxRenderScale, currentScale + 0.05f);\n                urpAsset.renderScale = currentScale;\n            }\n        }\n    }\n\n    void OnApplicationQuit()\n    {\n        if (urpAsset != null) urpAsset.renderScale = 1.0f;\n    }\n}' },
          { t: 'code', title: '4. CleanMemoryOnLoad.cs', code: 'using System.Collections;\nusing UnityEngine;\n\npublic class CleanMemoryOnLoad : MonoBehaviour\n{\n    void Start()\n    {\n        StartCoroutine(PurgeMemoryRoutine());\n    }\n\n    private IEnumerator PurgeMemoryRoutine()\n    {\n        yield return new WaitForSeconds(1.0f);\n\n        AsyncOperation unloadOperation = Resources.UnloadUnusedAssets();\n        while (!unloadOperation.isDone) yield return null;\n\n        System.GC.Collect();\n        Debug.Log("[Memory] VRAM and RAM cleaned successfully.");\n    }\n}' },
          { t: 'code', title: '5. SmartCharacterCuller.cs', code: 'using UnityEngine;\nusing UnityEngine.Rendering;\n\npublic class SmartCharacterCuller : MonoBehaviour\n{\n    [Header("Components to Manage")]\n    public Animator characterAnimator;\n    public SkinnedMeshRenderer characterMesh;\n\n    void Start()\n    {\n        if (characterAnimator == null) characterAnimator = GetComponentInChildren<Animator>();\n        if (characterMesh == null) characterMesh = GetComponentInChildren<SkinnedMeshRenderer>();\n\n        if (characterAnimator != null)\n            characterAnimator.cullingMode = AnimatorCullingMode.CullUpdateTransforms;\n    }\n\n    void OnBecameVisible()\n    {\n        if (characterMesh != null) characterMesh.shadowCastingMode = ShadowCastingMode.On;\n        if (characterAnimator != null) characterAnimator.enabled = true;\n    }\n\n    void OnBecameInvisible()\n    {\n        if (characterMesh != null) characterMesh.shadowCastingMode = ShadowCastingMode.Off;\n        if (characterAnimator != null) characterAnimator.enabled = false;\n    }\n}' },
          { t: 'code', title: '6. TextureMemoryGovernor.cs', code: 'using UnityEngine;\n\npublic class TextureMemoryGovernor : MonoBehaviour\n{\n    [Header("VRAM Budget in Megabytes")]\n    public int memoryBudgetMB = 512;\n    public int maxLevelReduction = 2;\n\n    void Awake()\n    {\n        QualitySettings.streamingMipmapsActive = true;\n        QualitySettings.streamingMipmapsMemoryBudget = memoryBudgetMB;\n        QualitySettings.streamingMipmapsMaxLevelReduction = maxLevelReduction;\n\n        Debug.Log($"[Rendering] Mipmap Streaming active with a {memoryBudgetMB}MB cap.");\n    }\n}' },
          { t: 'code', title: '7. ParticleBudgetController.cs', code: 'using UnityEngine;\n\n[RequireComponent(typeof(ParticleSystem))]\npublic class ParticleBudgetController : MonoBehaviour\n{\n    [Header("Distance Limits")]\n    public float cullDistance = 35f;\n\n    private ParticleSystem targetParticles;\n    private Transform cameraTransform;\n    private float checkTimer;\n\n    void Start()\n    {\n        targetParticles = GetComponent<ParticleSystem>();\n        if (Camera.main != null) cameraTransform = Camera.main.transform;\n    }\n\n    void Update()\n    {\n        if (cameraTransform == null) return;\n        checkTimer += Time.deltaTime;\n\n        if (checkTimer >= 0.5f)\n        {\n            checkTimer = 0f;\n            float dSq = (transform.position - cameraTransform.position).sqrMagnitude;\n\n            if (dSq > (cullDistance * cullDistance))\n            {\n                if (targetParticles.isPlaying) targetParticles.Pause();\n            }\n            else\n            {\n                if (targetParticles.isPaused) targetParticles.Play();\n            }\n        }\n    }\n}' },
          { t: 'code', title: '8. ThrottledCamera.cs', code: 'using UnityEngine;\n\n[RequireComponent(typeof(Camera))]\npublic class ThrottledCamera : MonoBehaviour\n{\n    [Header("Update Frequency")]\n    [Range(5, 30)] public int targetFPS = 15;\n\n    private Camera secondaryCamera;\n    private float interval;\n    private float timer;\n\n    void Awake()\n    {\n        secondaryCamera = GetComponent<Camera>();\n        secondaryCamera.enabled = false;\n        interval = 1.0f / targetFPS;\n    }\n\n    void Update()\n    {\n        timer += Time.deltaTime;\n\n        if (timer >= interval)\n        {\n            timer = 0f;\n            secondaryCamera.Render();\n        }\n    }\n}' }
        ]
      },
      {
        id: 'rn-matrix',
        title: 'What to use for which game, and how to check it worked',
        blocks: [
          { t: 'table', head: ['Kind of game', 'Use these', 'What you get'], rows: [
            ['Small ($6.99)', 'Forward+, SRP Batcher, SmartCharacterCuller, DynamicResolution', '100+ enemies on screen at a locked 60 FPS on a Steam Deck, with instant restarts and no crashes.'],
            ['Medium ($14.99)', 'SMAA High, DynamicShadowTrigger, ThrottledCamera for the minimap', 'A crisp isometric look with no smearing, and a minimap that costs about 75% less.'],
            ['Big ($22.99)', 'Neutral tonemapping, TextureMemoryGovernor, LightCuller, baked occlusion', 'Bright pastel colours that stay bright, and hubs with 50+ lights inside a 512 MB memory cap.']
          ] },
          { t: 'h', x: 'Your ten-minute checklist' },
          { t: 'list', items: [
            'Set the URP Rendering Path to Forward+.',
            'Set camera anti-aliasing to SMAA (High).',
            'Set the Global Volume tonemapping to Neutral.',
            'Cap shadow distance at 35 m with 2 cascades.',
            'Turn on the SRP Batcher on the URP Asset.',
            'Mark geometry as Static and bake occlusion culling.',
            'Attach SmartCharacterCuller to your enemy prefabs.',
            'Attach SimpleDynamicResolution to your performance manager.',
            'Open Window → Analysis → Frame Debugger and keep draw calls under 300.'
          ] },
          { t: 'pins', score: 8, max: 10, level: 'strong', label: 'Verified against Unity 6 documentation. The frame rates are targets — always profile your own build.' }
        ]
      }
    ]
  };
})();
