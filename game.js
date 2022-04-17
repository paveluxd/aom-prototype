    //CONFIGURATION & VARIABLES
    var config = {
        type: Phaser.AUTO,
        width: 640,
        height: 1200,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: true,
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var game = new Phaser.Game(config)
    var player, cursors, enemy, fireball, expNode, spike, scene

    //Player stats
    var playerStats = {
        life: 100,
        speed: 200,
        points: 0,
        experiece: 0,
        requiredExp: 1,
        level: 1,
        weapons:{
            fireball: {
                equiped: true,
                direction: 'top', 
                damage: 11,
                castSpeed: 2000,
                projSpeed: 360,
                dpsTimeout: 500, //how frequently projectile deals damage
                fadesOnHit: true, //projectiled destroyed on collision
                lastCastTime: Date.now()
            },
            spike: {
                equiped: true,
                damage: 7,
                castSpeed: 5000,
                projSpeed: 0,
                dpsTimeout: 500, //how frequently projectile deals damage
                fadesOnHit: true, //projectiled destroyed on collision
                lastCastTime: Date.now()
            },
            staff: {
                equiped: true,
                direction: 'left', 
                damage: 10,
                castSpeed: 1500,
                projSpeed: 0,
                dpsTimeout: 500, //how frequently projectile deals damage
                fadesOnHit: false, //projectiled destroyed on collision
                lastCastTime: Date.now()
            },
        }
    }

    var rewards = {
        reward1: {
            description: 'Add life'
        },
        reward2: {
            description: 'Add speed'
        },
        reward3: {
            description: 'Add damage'
        },
    }

    var enemyGroup = {
        speed: 80
    }


//PRELOAD
    function preload (){
        //Player
        this.load.image('player', './img/player.png')
        this.load.image('player-hit', './img/player-hit.png')
        this.load.spritesheet('player-walk', './img/player-walk.png', { frameWidth: 52, frameHeight: 68 });

        //Enemy
        this.load.image('enemy-1', './img/enemy-1.png')
        this.load.image('enemy-1-hit', './img/enemy-1-hit.png');
    
        //Misc
        this.load.image('map', './img/map.png')
        this.load.image('exp-node', './img/exp-node.png')

        //Projectiles
        this.load.image('fireball', './img/fireball.png')
        this.load.image('spike', './img/spike.png')
        this.load.image('staff', './img/staff.png')
    }

//CREATE
    function create (){
        // this.scene.pause()
        scene = this.scene

        //Variables for screen centre
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        //Background image
        this.add.image(375, 812, 'map')

        //Player sprite
        player = this.physics.add.sprite(screenCenterX, screenCenterY, 'player')
        player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });

        player.anims.play('walk', true);


        //Enemy sprite
        enemy = this.physics.add.group();
        setInterval(function()
        {
            if(Math.floor(Math.random()* 10) > 5){
                enemy.create(
                    (Phaser.Math.Between(-80,-600)),
                    (Phaser.Math.Between(1000,600)), //y
                    'enemy-1'
                )
            }
            else {
                enemy.create(
                    (Phaser.Math.Between(600,-80)),
                    (Phaser.Math.Between(-80,-80)), //y
                    'enemy-1'
                )
            }

            //Add custom properties to calculate dmg
            var lastEnemy = enemy.children.entries[enemy.children.entries.length - 1]
            lastEnemy.customHp = Math.floor(Math.random() * 10)
            lastEnemy.customHp = 10
            lastEnemy.lastHitTime = Date.now()
        }, 100)

        //Drop exp node sprite
        var expText = document.getElementById('exp')
        expText.innerHTML = playerStats.experiece

        // Shows Required EXP
        var nextLevelText = document.getElementById('nextlvl')
        nextLevelText.innerHTML = "Next Level at : " + playerStats.requiredExp

        // Shows Player Level
        var lvlText = document.getElementById('level')
        lvlText.innerHTML = "Level :" + playerStats.level

        expNode = this.physics.add.group()
        this.physics.add.overlap(player, expNode, collectExp, null, this);
        function collectExp (player, expNode){
            playerStats.experiece += 1
            expText.innerHTML = playerStats.experiece
            expNode.destroy()

            // Checks if playerEXP meets Required EXP for level UP
            if(playerStats.experiece == playerStats.requiredExp)
            {
                playerStats.requiredExp += Math.round(playerStats.requiredExp * 0.5)
                playerStats.level++

                nextLevelText.innerHTML = "Next level at: " +playerStats.requiredExp
                lvlText.innerHTML = "Level: " + playerStats.level

                //Decide what rewards to add
                var rewardKeys = Object.keys(rewards)
                for(i=0; i < 3; i++){
                    var rewardType = rNum(rewardKeys.length)
                    var reward = rewards[rewardKeys[rewardType]]
                    console.log(rewards[rewardKeys[rewardType]])

                    var button = document.getElementById('button' + (1 + i))
                    button.innerHTML = reward.description
                    button.setAttribute('data-type', rewardKeys[rewardType])
                }

                scene.pause();// Pauses game
                hide(); // pops up Modal
            }
        }

        //WEAPONS
            //Group cretion
            fireball = this.physics.add.group()
            spike = this.physics.add.group()
            staff = this.physics.add.group()

            setInterval(function(){
                //Fireball
                console.log()
                if(
                    playerStats.weapons.fireball.equiped === true && 
                    Date.now() - playerStats.weapons.fireball.lastCastTime > playerStats.weapons.fireball.castSpeed
                ){
                    //Update cast time
                    playerStats.weapons.fireball.lastCastTime = Date.now()

                    fireball.create(player.x, player.y,'fireball')
                    
                    fireball.children.entries.forEach(function (elem){                 
                        elem.angle = 90
                        elem.setVelocityY(-Math.abs(playerStats.weapons.fireball.projSpeed))
                    })
                }

                //Spike
                if (
                    playerStats.weapons.spike.equiped === true && 
                    Date.now() - playerStats.weapons.spike.lastCastTime > playerStats.weapons.spike.castSpeed
                ){
                    //Update cast time
                    playerStats.weapons.spike.lastCastTime = Date.now()

                    //Drop spike
                    spike.create(player.x + rNum(80), player.y + rNum(80), 'spike')
                }

                //Staff
                if (
                    playerStats.weapons.staff.equiped === true && 
                    Date.now() - playerStats.weapons.staff.lastCastTime > playerStats.weapons.staff.castSpeed
                ){

                    //Update cast time
                    playerStats.weapons.staff.lastCastTime = Date.now()
                
                    staff.create(player.x - 40, player.y, 'staff')
                    player.setTexture('player-hit')

                    setTimeout(function(){
                        staff.children.entries.forEach(function(elem){elem.destroy()})
                        player.setTexture('player')

                    }, 200)
                }
            }, 200);//repeat attack
        

        //Colliders
        this.physics.add.overlap(player, enemy, dmgPlayer, null, this)  //Player vs enemy
        this.physics.add.overlap(fireball, enemy, dmgEnemy, null, this) //Fireball vs enemy
        this.physics.add.overlap(spike, enemy, dmgEnemy, null, this) //Spike vs enemy
        this.physics.add.overlap(staff, enemy, dmgEnemy, null, this) //Staff vs enemy


        this.physics.add.collider(enemy, enemy) //Enemy vs Enemy

        //Points calculation function
        var timeText = document.getElementById('time')
        timeText.innerHTML = "0 point"
        setInterval(function(){
            //Update timer
            playerStats.points++
            timeText.innerHTML = playerStats.points + " points"
        }, 1000);
    
        //Keyboard keys
        cursors = this.input.keyboard.createCursorKeys()
    }
    
//UPDATE
    function update (){
        
        //Player movement wihth keyboard
        if (cursors.left.isDown) {
            player.setVelocityX(-Math.abs(playerStats.speed))

            //Turn drift
            if(player.body.velocity.y > 0){
                player.setVelocityY(player.body.velocity.y - 5)
            }
            else if (player.body.velocity.y < 0) {
                player.setVelocityY(player.body.velocity.y + 5)
            }
        }
        else if (cursors.right.isDown) {
            player.setVelocityX(playerStats.speed)

            //Turn drift
            if(player.body.velocity.y > 0){
                player.setVelocityY(player.body.velocity.y - 5)
            }
            else if (player.body.velocity.y < 0) {
                player.setVelocityY(player.body.velocity.y + 5)
            }
        }
        else if (cursors.up.isDown) {
            player.setVelocityY(-Math.abs(playerStats.speed))

            if(player.body.velocity.x > 0){
                player.setVelocityX(player.body.velocity.x - 5)
            }
            else if (player.body.velocity.x < 0) {
                player.setVelocityX(player.body.velocity.x + 5)
            }
        }
        else if (cursors.down.isDown) {
            player.setVelocityY(playerStats.speed)

            if(player.body.velocity.x > 0){
                player.setVelocityX(player.body.velocity.x - 5)
            } 
            else if (player.body.velocity.x < 0) {
                player.setVelocityX(player.body.velocity.x + 5)
            }
        }
        else {
            player.setVelocityX(0)
            player.setVelocityY(0)
        }

        //Enemy movement
        enemy.children.entries.forEach(function(element){

            if (player.x - 25 > element.x){
                element.setVelocityX(enemyGroup.speed)
            }
            else if (player.x + 25 < element.x){
                element.setVelocityX(-Math.abs(enemyGroup.speed))
            }
            else{
                element.setVelocityX(0)
            }

            if (player.y - 25 > element.y){
                element.setVelocityY(enemyGroup.speed)
            }
            else if (player.y + 25 < element.y){
                element.setVelocityY(-Math.abs(enemyGroup.speed))
            }
            else {
                element.setVelocityY(0)
            }
        })

        //Projectile movement
        staff.children.entries.forEach(function(elem){
            elem.x = player.x - 40
            elem.y = player.y
        })
        
    }

//GAME LOGIC
    //Player damage
    var lastRun = 0
    var delay = 500

    var lifeText = document.getElementById('life')
    lifeText.innerHTML = playerStats.life //Set life value to obj value

    function dmgPlayer(player, enemy){
        
        //Prevent function from executing more than N times per sec.
        if (lastRun > (Date.now() - delay))
            //Timer
            return;
            lastRun = Date.now();
            
            //Reduce live
            playerStats.life--

            //Player dead
            if(playerStats.life < 1){

                //Reset player object
                playerStats.life = 10
                playerStats.points = 0

                //Restart the game
                this.scene.restart();
            }

            //Update html life label
            lifeText.innerHTML = playerStats.life

            //Change player colour to black on overlap
            player.tint = 0x121212

            //Reset player to white after delay
            setTimeout(function(){ player.tint = 0xffffff; }, 100);
    }

    
    //ENEMY DAMAGE
    function dmgEnemy(projectile, enemy){
        var enemyHp = enemy.customHp
        var weaponDmg = playerStats.weapons[projectile.texture.key].damage

        //Enemy dead
        if (Date.now() - enemy.lastHitTime > playerStats.weapons[projectile.texture.key].dpsTimeout){
            //Update hit timer to prevent hit stacking
            enemy.lastHitTime = Date.now()

            //Enemy killed
            if(enemyHp <= weaponDmg){
                //Drop exp node
                expNode.create(enemy.x, enemy.y, 'exp-node')

                //Destory enemy
                enemy.destroy()
            }
            //Enemy hit
            else{
                enemy.customHp -= weaponDmg
                enemy.setTexture('enemy-1-hit') //changes image when hit
            }

            if(playerStats.weapons[projectile.texture.key].fadesOnHit === true){
                projectile.destroy()
            }
        }
    }
    
    //Modal
    function hide(){
        var modal = document.getElementById('modal')
        modal.classList.toggle('hide')
    }

    function rNum(maxValue){
        var value = Math.floor(Math.random() * maxValue)
        return value
    }

    function resumeScene(){
        scene.resume();
    }

    //Decides what reward to give
    function giveReward(button){

        //Reard 1
        if(button.getAttribute('data-type') === 'reward1'){
            console.log(1)
            //Add life
            playerStats.life += playerStats.level
        }
        // Reward 2
        else if (button.getAttribute('data-type') === 'reward2'){
            console.log(2)
        }
        // Reward 2
        else if (button.getAttribute('data-type') === 'reward3'){
            console.log(3)
        } 
        else {
            console.log('No reward found.')
        }

        resumeScene()
    }