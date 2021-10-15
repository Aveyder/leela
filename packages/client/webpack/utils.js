module.exports = {
    pluginsMerge(first, second, key) {
        if (key === 'plugins') {
            const index = first.findIndex(plugin => plugin.constructor.name === 'HtmlWebpackPlugin');

            first.splice(index, 1, ...second);

            return first
        }
        return undefined;
    }
};
