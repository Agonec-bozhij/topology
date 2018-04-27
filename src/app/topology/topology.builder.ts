export abstract class TopologyBuilder {

    /**
     * Алгоритм инициализации графа
     */
    protected build(): void {
        this.setLocalData();
        this.setMarker();
        this.setSimulation();
        this.setLinks();
        this.setDragNDrop();
        this.setNodes();
        this.setTick();
        this.setTooltip();
    }

    /**
     * Установка данных для позиционирования графа из локал стореджа.
     */
    protected abstract setLocalData(): void;

    /**
     * Установка симуляции графа
     */
    protected abstract setSimulation(): void;

    /**
     * Установка поведения Drag`n`Drop
     */
    protected abstract setDragNDrop(): void;

    /**
     * Установка поведения элементов типа "узел" и "связь" при перемещении
     */
    protected abstract setTick(): void;

    /**
     * Установка всплывающей подсказки
     */
    protected abstract setTooltip(): void;

    /**
     * Установка связей
     */
    protected abstract setLinks(): void;

    /**
     * Установка узлов
     */
    protected abstract setNodes(): void;

    /**
     * Установка маркера для отображения направления каналов.
     */
    protected abstract setMarker(): void;
}
