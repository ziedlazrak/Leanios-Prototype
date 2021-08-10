import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";

const tl = gsap.timeline({ defaults: { ease: "power1.out" } });

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

const loader = new GLTFLoader();
//var mixer = [];

var mixers = [];
var clips = [];
var action = null;

// scroll stuff
var body = document.body,
    html = document.documentElement;

var height = Math.max(body.scrollHeight, body.offsetHeight,
    html.clientHeight, html.scrollHeight, html.offsetHeight);

const sizes = {
    width: window.innerWidth,
    height: height
}

var aspect = window.innerWidth / height;
var d = 20;
//const camera = new THREE.PerspectiveCamera( 60,sizes.width/sizes.height );

const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

//const controls = new OrbitControls(camera,canvas)
//controls.enableDamping = true 

camera.position.set(15, 15, 15); // all components equal
camera.lookAt(scene.position);

scene.add(camera);



const currentTimeline = window.pageYOffset / height;

const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
})


const axesHelper = new THREE.AxesHelper(100);
//scene.add( axesHelper );

let root = null
let mixer = null
loader.load('better1.gltf', function(gltf) {

    gltf.mixer = new THREE.AnimationMixer(gltf.scene);
    mixers.push(gltf.mixer);
    gltf.mixer.addEventListener('finished', function(e) {
        console.log('finished');
    });



    gltf.animations.forEach((clip) => {

        action = gltf.mixer.clipAction(clip);
        clips.push(clip);
        //action.setLoop( THREE.LoopOnce );
        //action.clampWhenFinished = true;
        action.loop = true
            //action.timeScale = -1
        action.play();

    });

    /*
        mixer= new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => {mixer.clipAction(clip).play(); });
    */
    root = gltf.scene;
    root.scale.set(1.5, 1.5, 1.5);
    root.position.set(-15, -8, -26);
    scene.add(root);
    /*
    while(root.children.length){
        scene.add(root.children[0])
    }*/
    //tl.to(root.position, { duration: 1, x: 2});


}, undefined, function(error) {

    console.error(error);

});




tl.to(loader.position, { duration: 1, x: 2 });

const light = new THREE.RectAreaLight(0xE2E6F3, 50, 3, 1)
light.position.set(1, -15, 0.5)
    //light.lookAt(new THREE.Vector3)
    //scene.add(light)


const light1 = new THREE.DirectionalLight(0xE2E6F3, 0.3)
light1.position.set(1, 50, 40)
light1.castShadow = true
    //light.lookAt(new THREE.Vector3)
scene.add(light1)

const light1helper = new THREE.DirectionalLightHelper(light1, 0.2)
    //scene.add(light1helper)

const light2 = new THREE.PointLight(0xEB0510, 0.4)
light2.position.set(1, -0.5, 0.5)
scene.add(light2)


window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
})

const renderer = new THREE.WebGL1Renderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.gammaOutput = true
renderer.setClearColor(0x03000d, 1);


/*
function updateAnimation(direction) {
    const delta = direction * 5 * clock.getDelta();
    for (let i = 0; i < mixers.length; ++i) {
      const mixer = mixers[i];
      const clip = clips[i];
      const duration = clip.duration;
      const newTime = THREE.MathUtils.clamp(mixer.time + delta, 0, duration);
      
      console.log("duration",duration);
      console.log(newTime);
      mixer.setTime(newTime);
    }
  }

  function onMouseWheel( event ) {
    updateAnimation(Math.sign(event.deltaY)); 
  }*/


var lastScrollTop = pageYOffset;

window.addEventListener("scroll", function() {
    var st = window.pageYOffset || document.documentElement.scrollTop;
    const delta = checkScrollSpeed() / 100;

    for (let i = 0; i < mixers.length; ++i) {
        const mixer = mixers[i];
        const clip = clips[i];
        const duration = clip.duration;
        const newTime = THREE.MathUtils.clamp(mixer.time + delta, 0, duration);
        //console.log("duration",duration);
        //console.log(newTime);

        if ((st <= lastScrollTop) && (newTime >= 0)) {
            mixer.setTime(newTime);
        } else if ((st > lastScrollTop) && (newTime < duration)) {
            mixer.setTime(newTime);
        }
    }

    lastScrollTop = st <= 0 ? 0 : st;
}, false);


var checkScrollSpeed = (function(settings) {
    settings = settings || {};

    var lastPos, newPos, timer, delta,
        delay = settings.delay || 50;

    function clear() {
        lastPos = null;
        delta = 0;
    }

    clear();

    return function() {
        newPos = window.scrollY;
        if (lastPos != null) {
            delta = newPos - lastPos;
        }
        lastPos = newPos;
        clearTimeout(timer);
        timer = setTimeout(clear, delay);
        return delta;
    };
})();


/*
window.onscroll = function() {
    console.log(checkScrollSpeed());
};*/

window.addEventListener('mousewheel', onMouseWheel, false);

function onMouseWheel(event) {

    const delta = checkScrollSpeed() / 100;
    // console.log(delta);

    for (let i = 0; i < mixers.length; ++i) {
        const mixer = mixers[i];
        const clip = clips[i];
        const duration = clip.duration;
        const newTime = THREE.MathUtils.clamp(mixer.time + delta, 0, duration);
        //console.log("duration",duration);
        //console.log(newTime);
        console.log("please", Math.sign(event.deltaY));

        if ((Math.sign(event.deltaY) == -1) && (newTime >= 0)) {
            mixer.setTime(newTime);
        } else if ((Math.sign(event.deltaY) == 1) && (newTime < duration)) {
            mixer.setTime(newTime);
        }
    }
}

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    //const delta = clock.getDelta()

    /*
    if(mixer !== null)
    {
        window.onscroll = function() {
            mixer.update(delta)
        };
       
    }*/

    //root.rotation.x = -(cursor.x*4);
    root.rotation.x = cursor.x * 0.1;

    root.rotation.y = window.pageYOffset * 0.01;
    //controls.update()


    renderer.render(scene, camera)
}

animate();