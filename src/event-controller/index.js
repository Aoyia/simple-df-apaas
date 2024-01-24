class EventInstance {
  constructor(eventCode, handler, options = {}) {
    this.eventCode = eventCode;
    this.handler = handler;
    this.priority = options.priority || 0;
    this.persist = options.persist || false;
    this.vueComponentInstance = null;
  }
}

class EventController {
  constructor() {
    this.currentEvent = null;
    this.events = new Map();
  }

  register(eventCode, handler, options = {}) {
    // 创建事件实例
    const eventInstance = new EventInstance(eventCode, handler, options);

    // 判断事件是否已存在
    if (!this.events.has(eventCode)) {
      this.events.set(eventCode, []);
    }

    const eventList = this.events.get(eventCode);
    // 添加到事件列表
    eventList.push(eventInstance);
    // 根据优先级进行排序
    eventList.sort((a, b) => b.priority - a.priority);
  }

  unregister(eventCode, handler) {
    if (!this.events.has(eventCode)) {
      return;
    }

    // 如果没有提供处理器，则移除所有处理器
    if (!handler) {
      this.events.delete(eventCode);
      return;
    }

    // 移除特定处理器
    const eventList = this.events.get(eventCode);
    for (let i = 0; i < eventList.length; i++) {
      if (eventList[i].handler === handler) {
        eventList.splice(i, 1);
        break;
      }
    }

    // 如果没有处理器剩下，移除整个事件
    if (eventList.length === 0) {
      this.events.delete(eventCode);
    }
  }

  trigger(eventCode, ...args) {
    return new Promise((resolve, reject) => {
      if (!this.events.has(eventCode)) {
        return reject(new Error("Event not found"));
      }

      // 顺序执行每个事件，直到一个事件被执行或者所有事件都被执行
      const eventList = this.events.get(eventCode);
      const results = [];

      const executeNext = (i) => {
        if (i >= eventList.length) {
          console.log(results, "results");
          resolve(results);
          this.currentEvent = null;
          return Promise.all(results);
        }

        const eventInstance = eventList[i];
        i++;

        this.currentEvent = eventInstance;

        return Promise.resolve()
          .then(() => {
            const getPromise = eventInstance.handler(...args);
            return getPromise;
          })
          .then((result) => {
            eventInstance.vueComponentInstance &&
              eventInstance.vueComponentInstance.$destroy();
            eventInstance.vueComponentInstance = null;

            return result;
            // TODO 持久化事件
            // if (!eventInstance.persist) {
            //   document.body.removeChild(eventInstance.instance.$el.parentNode);
            //   this.unregister(eventCode, eventInstance.handler);
            // }
          })
          .then((result) => {
            results.push(result);
            executeNext(i);
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      };
      executeNext(0);
    });
  }

  // 关联VueComponent 实例 与 EventInstance 实例
  associate(instance) {
    console.log("执行了关联操作");
    if (!this.currentEvent) {
      return;
    }
    // 判断是否已经关联
    if (this.currentEvent.vueComponentInstance) {
      return;
    }

    this.currentEvent.vueComponentInstance = instance;
  }
}

export default new EventController();
