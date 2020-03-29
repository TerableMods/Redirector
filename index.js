const Vec3 = require('tera-vec3');
const config = require('./config.json');

module.exports = function Redirector(mod) {
  const chestIds = [81341, 81342];
  const data = {
    7004:[
      {	// Frymount
        spawn: new Vec3(115023, 90044, 6378),		// teleporting to Bahaar using Vanguard window redirects to:
        redirect: new Vec3(115320, 96900, 7196),	// Bahaar's Sanctum teleportal
        w: 1.57
      } 
    ],
    7005: [
      {	// Velika
        spawn: new Vec3(-481, 6301, 1956),			// resetting Instances inside of Ghillieglade redirects to:
        redirect: new Vec3(2975, 7528, 1686),		// banker in Creation Workshop
        w: -0.95
      },
      {	// Velika(2)
        spawn: new Vec3(1604, 3044, 1744),			// teleporting to Velika using Village Atlas redirects to:
        redirect: new Vec3(-400, 8720, 2179),		// banker in Freedom Plaza
        w: -0.95
      }
    ],
    7031: [
      {	// Highwatch
        spawn: new Vec3(22205, 4870, 6191),			// using the Redeem button in Vanguard window redirects to:
        redirect: new Vec3(19395, 4335, 6191),		// banker in Hall of Accord (upstairs)
        w: 1.23
      },
      {	// Highwatch(2)
        spawn: new Vec3(21222, 5919, 6216),			// telporting to Highwatch using Village Atlas redirects to:
        redirect: new Vec3(22438, 1605, 5857),		// banker in Bazaar (downstairs)
        w: -0.77
      }
    ],
    9713: [
      {	// Ghillieglade
        spawn: new Vec3(52245, 115638, 4308),		// entering Ghillieglade redirects to:
        redirect: new Vec3(52227, 117334, 4386),	// end of bridge to Dominolith & Banyakas
        w: 1.6
      }
    ],
    9781: [
      {	// Velik's Sanctuary Normal
      spawn: new Vec3(43948, -134721, 29070),		// entering Velik's Sanctuary Normal redirects to:
      redirect: new Vec3(44353, -126459, 16788),	// platform after pegasus flight
      w: 2.97
      }
    ],
    9981: [
      {	// Velik's Sanctuary Hard
      spawn: new Vec3(43948, -134721, 29070),		// entering Velik's Sanctuary Hard redirects to:
      redirect: new Vec3(44353, -126459, 16788),	// platform after the pegasus flight
      w: 2.97
      }
    ]
  };

  let enabled = config.enabled || true;
  let reset = false;

  mod.game.me.on('change_zone', (zone) => {
    if (!enabled) return;
    if (zone == 9714 && reset) {
      mod.send('C_RESET_ALL_DUNGEON', 1, {});
      reset = false;
      mod.command.message('Instances have been reset'.clr("00FFFF"));
    }
  });

  mod.hook('S_SPAWN_ME', 3, event => {
    if (!enabled || !data[mod.game.me.zone]) return;
    data[mod.game.me.zone].forEach(zone => {
      if (zone.spawn.dist3D(event.loc) <= 5) {
        event.loc = zone.redirect;
        event.w = zone.w;
      }
    });
    return true;
  });

  mod.hook('S_SPAWN_NPC', 11, event => {
    if (!enabled) return;
    if (event.huntingZoneId == 713 && chestIds.includes(event.templateId)) {
      reset = true;
      mod.command.message('Entering Velik\'s Sanctuary (Ghillieglade) will reset all Instances'.clr("FF8000"));
    }
  });

  mod.hook('C_RESET_ALL_DUNGEON', 1, event => {
    if (!enabled) return;
    if (mod.game.me.zone == 9713) {
      reset = false;
      mod.command.message('Instances have been reset (manually)'.clr("007FFF"));
    }
  });

  mod.command.add('redirect', {
    $default() {
      mod.command.message('Usage: /8 redirect > Turns Module ON/OFF.'.clr("FF00FF"));
    },
    $none() {
      enabled = !enabled;
      mod.command.message(enabled ? 'Enabled'.clr("00FF00") : 'Disabled'.clr("FF0000"));
    },
  })

  this.destructor = function() {
    mod.command.remove('redirect');
  };
};
